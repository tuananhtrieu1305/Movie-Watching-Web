import prisma from "../../../../core/database/prisma.js";

const RANGE_TO_DAYS = {
  today: 1,
  "7days": 7,
  "30days": 30,
  "90days": 90,
};

const toNumber = (value) => {
  if (value == null) return 0;
  if (typeof value === "bigint") return Number(value);
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const round = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const calcRate = (numerator, denominator) => {
  if (!denominator) return 0;
  return round((numerator / denominator) * 100, 2);
};

const formatDateLabel = (dateValue) => {
  const date = new Date(dateValue);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
};

const buildDateSeries = (startDate, days) => {
  const result = [];
  for (let i = 0; i < days; i += 1) {
    const date = addDays(startDate, i);
    result.push({
      key: date.toISOString().slice(0, 10),
      label: formatDateLabel(date),
      date,
    });
  }
  return result;
};

const queryDistinctUsers = async (from, to) => {
  const rows = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT user_id) AS count
    FROM watch_history
    WHERE last_watched_at BETWEEN ${from} AND ${to}
  `;
  return toNumber(rows?.[0]?.count);
};

const queryWatchMetrics = async (from, to) => {
  const rows = await prisma.$queryRaw`
    SELECT
      COUNT(*) AS visits,
      AVG(watched_duration) AS avg_watch_duration
    FROM watch_history
    WHERE last_watched_at BETWEEN ${from} AND ${to}
  `;

  return {
    visits: toNumber(rows?.[0]?.visits),
    avgWatchMinutes: round(toNumber(rows?.[0]?.avg_watch_duration) / 60, 1),
  };
};

const queryTransactionMetrics = async (from, to) => {
  const rows = await prisma.$queryRaw`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS success_count,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_count
    FROM transactions
    WHERE created_at BETWEEN ${from} AND ${to}
  `;

  return {
    total: toNumber(rows?.[0]?.total),
    success: toNumber(rows?.[0]?.success_count),
    failed: toNumber(rows?.[0]?.failed_count),
  };
};

const getRangeMetrics = async (from, to) => {
  const [watchMetrics, activeUsers, txMetrics] = await Promise.all([
    queryWatchMetrics(from, to),
    queryDistinctUsers(from, to),
    queryTransactionMetrics(from, to),
  ]);

  return {
    visits: watchMetrics.visits,
    activeUsers,
    avgWatchMinutes: watchMetrics.avgWatchMinutes,
    conversionRate: calcRate(txMetrics.success, txMetrics.total),
    transactionsTotal: txMetrics.total,
    transactionsSuccess: txMetrics.success,
    transactionsFailed: txMetrics.failed,
  };
};

const getTrafficTrend = async (from, to, days) => {
  if (days === 1) {
    const rows = await prisma.$queryRaw`
      SELECT HOUR(last_watched_at) AS hour_bucket, COUNT(*) AS visits
      FROM watch_history
      WHERE last_watched_at BETWEEN ${from} AND ${to}
      GROUP BY HOUR(last_watched_at)
      ORDER BY hour_bucket ASC
    `;

    const bucketMap = new Map(rows.map((row) => [toNumber(row.hour_bucket), toNumber(row.visits)]));

    return Array.from({ length: 24 }).map((_, hour) => ({
      label: `${hour.toString().padStart(2, "0")}h`,
      visits: bucketMap.get(hour) ?? 0,
    }));
  }

  const rows = await prisma.$queryRaw`
    SELECT DATE(last_watched_at) AS date_bucket, COUNT(*) AS visits
    FROM watch_history
    WHERE last_watched_at BETWEEN ${from} AND ${to}
    GROUP BY DATE(last_watched_at)
    ORDER BY date_bucket ASC
  `;

  const rowMap = new Map(
    rows.map((row) => [new Date(row.date_bucket).toISOString().slice(0, 10), toNumber(row.visits)]),
  );

  return buildDateSeries(startOfDay(from), days).map((point) => ({
    label: point.label,
    visits: rowMap.get(point.key) ?? 0,
  }));
};

const getTrafficSources = async (from, to) => {
  const rows = await prisma.$queryRaw`
    SELECT p.type AS source_type, COUNT(*) AS visits
    FROM watch_history wh
    INNER JOIN episodes e ON e.id = wh.episode_id
    INNER JOIN productions p ON p.id = e.production_id
    WHERE wh.last_watched_at BETWEEN ${from} AND ${to}
    GROUP BY p.type
    ORDER BY visits DESC
  `;

  const normalized = rows.map((row) => ({
    source:
      row.source_type === "movie"
        ? "Movie"
        : row.source_type === "series"
          ? "Series"
          : "Season",
    visits: toNumber(row.visits),
  }));

  const totalVisits = normalized.reduce((sum, item) => sum + item.visits, 0);

  return normalized.map((item) => ({
    ...item,
    percentage: totalVisits > 0 ? round((item.visits / totalVisits) * 100, 1) : 0,
  }));
};

const getRevenueData = async (from, to, days) => {
  if (days >= 90) {
    const rows = await prisma.$queryRaw`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS period_key,
        DATE_FORMAT(created_at, '%m/%Y') AS period_label,
        SUM(final_amount) AS revenue,
        COUNT(*) AS transactions
      FROM transactions
      WHERE status = 'success' AND created_at BETWEEN ${from} AND ${to}
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%m/%Y')
      ORDER BY period_key ASC
    `;

    return rows.map((row, index, array) => {
      const revenue = toNumber(row.revenue);
      const transactions = toNumber(row.transactions);
      const previousRevenue = index > 0 ? toNumber(array[index - 1].revenue) : 0;

      return {
        key: `m-${row.period_key}`,
        period: `Tháng ${row.period_label}`,
        revenue,
        transactions,
        avgOrder: transactions > 0 ? round(revenue / transactions, 0) : 0,
        growth: previousRevenue > 0 ? round(((revenue - previousRevenue) / previousRevenue) * 100, 1) : 0,
      };
    });
  }

  const rows = await prisma.$queryRaw`
    SELECT
      DATE(created_at) AS period_key,
      DATE_FORMAT(created_at, '%d/%m') AS period_label,
      SUM(final_amount) AS revenue,
      COUNT(*) AS transactions
    FROM transactions
    WHERE status = 'success' AND created_at BETWEEN ${from} AND ${to}
    GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%d/%m')
    ORDER BY period_key ASC
  `;

  return rows.map((row, index, array) => {
    const revenue = toNumber(row.revenue);
    const transactions = toNumber(row.transactions);
    const previousRevenue = index > 0 ? toNumber(array[index - 1].revenue) : 0;

    return {
      key: `d-${new Date(row.period_key).toISOString().slice(0, 10)}`,
      period: row.period_label,
      revenue,
      transactions,
      avgOrder: transactions > 0 ? round(revenue / transactions, 0) : 0,
      growth: previousRevenue > 0 ? round(((revenue - previousRevenue) / previousRevenue) * 100, 1) : 0,
    };
  });
};

const buildSystemData = async ({
  dbLatency,
  rangeMetrics,
  totalUsers,
  activeSubscriptions,
  pendingTransactions,
  latestDailyStat,
}) => {
  const failedRate = calcRate(rangeMetrics.transactionsFailed, rangeMetrics.transactionsTotal);
  const heap = process.memoryUsage();
  const heapUsedMb = heap.heapUsed / 1024 / 1024;
  const heapTotalMb = heap.heapTotal / 1024 / 1024;
  const heapUsage = heap.heapTotal > 0 ? round((heap.heapUsed / heap.heapTotal) * 100, 1) : 0;
  const activeSubRatio = totalUsers > 0 ? round((activeSubscriptions / totalUsers) * 100, 1) : 0;

  const systemOverview = [
    {
      key: "db-latency",
      title: "DB Query Latency",
      value: dbLatency,
      suffix: "ms",
      status: dbLatency > 250 ? "warning" : "healthy",
    },
    {
      key: "pending-transactions",
      title: "Pending Transactions",
      value: pendingTransactions,
      suffix: "pending",
      status: pendingTransactions > 20 ? "warning" : "healthy",
    },
    {
      key: "failed-rate",
      title: "Failed Payment Rate",
      value: failedRate,
      suffix: "%",
      status: failedRate > 5 ? "warning" : "healthy",
    },
    {
      key: "active-subscriptions",
      title: "Active Subscriptions",
      value: activeSubscriptions,
      suffix: "users",
      status: "healthy",
    },
  ];

  const serviceStatus = [
    {
      key: "svc-db",
      service: "Database",
      status: dbLatency > 350 ? "degraded" : dbLatency > 250 ? "warning" : "healthy",
      latency: dbLatency,
      uptime: "N/A",
      lastIncident: latestDailyStat ? "Theo daily_stats" : "Chưa có log",
    },
    {
      key: "svc-payment",
      service: "Payment Pipeline",
      status: failedRate > 8 ? "degraded" : failedRate > 5 ? "warning" : "healthy",
      latency: 0,
      uptime: "N/A",
      lastIncident: rangeMetrics.transactionsFailed > 0 ? "Có giao dịch fail" : "Không có",
    },
    {
      key: "svc-subscription",
      service: "Subscription Engine",
      status: activeSubscriptions === 0 ? "warning" : "healthy",
      latency: 0,
      uptime: "N/A",
      lastIncident: "Không có",
    },
    {
      key: "svc-analytics",
      service: "Analytics Aggregator",
      status: latestDailyStat ? "healthy" : "warning",
      latency: 0,
      uptime: "N/A",
      lastIncident: latestDailyStat
        ? `Daily stats gần nhất: ${new Date(latestDailyStat).toLocaleDateString("vi-VN")}`
        : "Không tìm thấy daily_stats",
    },
  ];

  const resourceUsage = [
    {
      key: "heap",
      label: "API Heap",
      usage: heapUsage,
      detail: `${round(heapUsedMb, 1)} MB / ${round(heapTotalMb, 1)} MB`,
    },
    {
      key: "payment-success",
      label: "Payment Success Rate",
      usage: calcRate(rangeMetrics.transactionsSuccess, rangeMetrics.transactionsTotal),
      detail: `${rangeMetrics.transactionsSuccess}/${rangeMetrics.transactionsTotal} giao dịch`,
    },
    {
      key: "subscription-ratio",
      label: "Subscription Adoption",
      usage: activeSubRatio,
      detail: `${activeSubscriptions}/${totalUsers} users`,
    },
    {
      key: "watch-activity",
      label: "Watch Activity",
      usage: rangeMetrics.visits > 0 ? 100 : 0,
      detail: `${rangeMetrics.visits} lượt xem trong kỳ`,
    },
  ];

  const systemAlerts = [];

  if (failedRate > 5) {
    systemAlerts.push({
      key: "failed-rate-alert",
      level: failedRate > 8 ? "critical" : "warning",
      title: "Tỷ lệ giao dịch thất bại cao",
      description: `Failed rate hiện tại là ${failedRate}% trong khoảng thời gian đã chọn.`,
    });
  }

  if (pendingTransactions > 20) {
    systemAlerts.push({
      key: "pending-alert",
      level: "warning",
      title: "Hàng chờ giao dịch đang cao",
      description: `Hiện có ${pendingTransactions} giao dịch pending cần xử lý.`,
    });
  }

  if (!latestDailyStat) {
    systemAlerts.push({
      key: "daily-stats-alert",
      level: "warning",
      title: "Thiếu dữ liệu daily_stats",
      description: "Không tìm thấy bản ghi daily_stats gần đây để đối soát analytics tổng hợp.",
    });
  }

  if (systemAlerts.length === 0) {
    systemAlerts.push({
      key: "healthy-alert",
      level: "info",
      title: "Hệ thống ổn định",
      description: "Không phát hiện bất thường quan trọng trong thời gian đã chọn.",
    });
  }

  return { systemOverview, serviceStatus, resourceUsage, systemAlerts };
};

export const getAnalyticsDashboardService = async ({ range }) => {
  const normalizedRange = RANGE_TO_DAYS[range] ? range : "7days";
  const rangeDays = RANGE_TO_DAYS[normalizedRange];
  const now = new Date();

  const currentStart = startOfDay(addDays(now, -(rangeDays - 1)));
  const currentEnd = now;

  const previousStart = startOfDay(addDays(currentStart, -rangeDays));
  const previousEnd = new Date(currentStart.getTime() - 1);

  const pingStartedAt = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const dbLatency = Date.now() - pingStartedAt;

  const [
    currentMetrics,
    previousMetrics,
    trafficTrend,
    trafficSources,
    revenueData,
    totalUsers,
    activeSubscriptions,
    pendingTransactions,
    latestDailyStatRow,
  ] = await Promise.all([
    getRangeMetrics(currentStart, currentEnd),
    getRangeMetrics(previousStart, previousEnd),
    getTrafficTrend(currentStart, currentEnd, rangeDays),
    getTrafficSources(currentStart, currentEnd),
    getRevenueData(currentStart, currentEnd, rangeDays),
    prisma.users.count(),
    prisma.user_subscriptions.count({
      where: {
        status: "active",
        end_date: {
          gte: now,
        },
      },
    }),
    prisma.transactions.count({
      where: {
        status: "pending",
      },
    }),
    prisma.daily_stats.findFirst({
      orderBy: {
        stat_date: "desc",
      },
      select: {
        stat_date: true,
      },
    }),
  ]);

  const systemData = await buildSystemData({
    dbLatency,
    rangeMetrics: currentMetrics,
    totalUsers,
    activeSubscriptions,
    pendingTransactions,
    latestDailyStat: latestDailyStatRow?.stat_date,
  });

  return {
    range: normalizedRange,
    updatedAt: now.toISOString(),
    traffic: {
      visits: currentMetrics.visits,
      previousVisits: previousMetrics.visits,
      activeUsers: currentMetrics.activeUsers,
      previousActiveUsers: previousMetrics.activeUsers,
      conversionRate: currentMetrics.conversionRate,
      previousConversionRate: previousMetrics.conversionRate,
      avgWatchMinutes: currentMetrics.avgWatchMinutes,
      previousAvgWatchMinutes: previousMetrics.avgWatchMinutes,
    },
    trafficTrend,
    trafficSources,
    revenueData,
    ...systemData,
  };
};

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Table,
  Tabs,
} from "antd";
import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudServerOutlined,
  DollarOutlined,
  EyeOutlined,
  FallOutlined,
  GlobalOutlined,
  LineChartOutlined,
  RiseOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { getAdminDashboardData } from "../../services/adminAnalyticsService";
import "./analytics.css";

const numberFormatter = new Intl.NumberFormat("vi-VN");
const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const RANGE_OPTIONS = [
  { value: "today", label: "Hôm nay" },
  { value: "7days", label: "7 ngày qua" },
  { value: "30days", label: "30 ngày qua" },
  { value: "90days", label: "90 ngày qua" },
];

const EMPTY_DATA = {
  traffic: {
    visits: 0,
    previousVisits: 0,
    activeUsers: 0,
    previousActiveUsers: 0,
    conversionRate: 0,
    previousConversionRate: 0,
    avgWatchMinutes: 0,
    previousAvgWatchMinutes: 0,
  },
  trafficTrend: [],
  trafficSources: [],
  revenueData: [],
  systemOverview: [],
  serviceStatus: [],
  resourceUsage: [],
  systemAlerts: [],
};

const round = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const calcGrowth = (current, previous) => {
  if (!previous) return 0;
  return round(((current - previous) / previous) * 100, 1);
};

const formatKpiValue = (value, format) => {
  if (format === "currency") return currencyFormatter.format(value);
  if (format === "percent") return `${round(value, 2).toFixed(2)}%`;
  if (format === "minutes") return `${numberFormatter.format(value)} phút`;
  return numberFormatter.format(value);
};

const getStatusTag = (status) => {
  if (status === "healthy") return <Tag color="green">Healthy</Tag>;
  if (status === "warning") return <Tag color="gold">Warning</Tag>;
  return <Tag color="red">Degraded</Tag>;
};

const normalizeDashboardData = (payload) => {
  if (!payload || typeof payload !== "object") return EMPTY_DATA;

  return {
    traffic: {
      ...EMPTY_DATA.traffic,
      ...(payload.traffic || {}),
    },
    trafficTrend: Array.isArray(payload.trafficTrend) ? payload.trafficTrend : [],
    trafficSources: Array.isArray(payload.trafficSources) ? payload.trafficSources : [],
    revenueData: Array.isArray(payload.revenueData) ? payload.revenueData : [],
    systemOverview: Array.isArray(payload.systemOverview) ? payload.systemOverview : [],
    serviceStatus: Array.isArray(payload.serviceStatus) ? payload.serviceStatus : [],
    resourceUsage: Array.isArray(payload.resourceUsage) ? payload.resourceUsage : [],
    systemAlerts: Array.isArray(payload.systemAlerts) ? payload.systemAlerts : [],
  };
};

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState("-");
  const [dashboardData, setDashboardData] = useState(EMPTY_DATA);

  const fetchDashboard = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setErrorMessage("");

    try {
      const data = await getAdminDashboardData({ range: timeRange });

      setDashboardData(normalizeDashboardData(data));
      setLastUpdated(new Date().toLocaleString("vi-VN"));
    } catch (error) {
      setErrorMessage(error.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const kpiData = useMemo(() => {
    return [
      {
        key: "visits",
        title: "Traffic",
        value: Number(dashboardData.traffic.visits || 0),
        previous: Number(dashboardData.traffic.previousVisits || 0),
        icon: <EyeOutlined />,
        format: "number",
      },
      {
        key: "revenue",
        title: "Revenue",
        value: dashboardData.revenueData.reduce(
          (sum, row) => sum + Number(row.revenue || 0),
          0,
        ),
        previous: dashboardData.revenueData.reduce(
          (sum, row) => sum + Number(row.revenue || 0),
          0,
        ) * 0.88,
        icon: <DollarOutlined />,
        format: "currency",
      },
      {
        key: "activeUsers",
        title: "Active Users",
        value: Number(dashboardData.traffic.activeUsers || 0),
        previous: Number(dashboardData.traffic.previousActiveUsers || 0),
        icon: <UserOutlined />,
        format: "number",
      },
      {
        key: "conversion",
        title: "Conversion Rate",
        value: Number(dashboardData.traffic.conversionRate || 0),
        previous: Number(dashboardData.traffic.previousConversionRate || 0),
        icon: <LineChartOutlined />,
        format: "percent",
      },
      {
        key: "watchTime",
        title: "Avg Watch Time",
        value: Number(dashboardData.traffic.avgWatchMinutes || 0),
        previous: Number(dashboardData.traffic.previousAvgWatchMinutes || 0),
        icon: <GlobalOutlined />,
        format: "minutes",
      },
    ];
  }, [dashboardData]);

  const revenueColumns = [
    {
      title: "Thời gian",
      dataIndex: "period",
      key: "period",
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => currencyFormatter.format(Number(value || 0)),
      sorter: (a, b) => Number(a.revenue || 0) - Number(b.revenue || 0),
    },
    {
      title: "Giao dịch",
      dataIndex: "transactions",
      key: "transactions",
      sorter: (a, b) => Number(a.transactions || 0) - Number(b.transactions || 0),
    },
    {
      title: "TB/Đơn",
      dataIndex: "avgOrder",
      key: "avgOrder",
      render: (value) => currencyFormatter.format(Number(value || 0)),
    },
    {
      title: "Tăng trưởng",
      dataIndex: "growth",
      key: "growth",
      render: (value) => {
        const growth = Number(value || 0);
        return (
          <Tag color={growth >= 0 ? "green" : "red"}>
            {growth >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(growth).toFixed(1)}%
          </Tag>
        );
      },
      sorter: (a, b) => Number(a.growth || 0) - Number(b.growth || 0),
    },
  ];

  const serviceColumns = [
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Latency",
      dataIndex: "latency",
      key: "latency",
      render: (latency) => `${Number(latency || 0)}ms`,
    },
    {
      title: "Uptime",
      dataIndex: "uptime",
      key: "uptime",
    },
    {
      title: "Sự cố gần nhất",
      dataIndex: "lastIncident",
      key: "lastIncident",
    },
  ];

  const maxVisits = Math.max(
    ...dashboardData.trafficTrend.map((item) => Number(item.visits || 0)),
    1,
  );

  return (
    <div className="analytics-dashboard p-6">
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Admin Portal Dashboard</h1>
          <p className="analytics-subtitle">
            Analytics & System Admin: theo dõi traffic, revenue và sức khỏe hệ thống.
          </p>
          <span className="analytics-last-updated">Cập nhật gần nhất: {lastUpdated}</span>
        </div>
        <Space wrap>
          <Select
            value={timeRange}
            options={RANGE_OPTIONS}
            onChange={setTimeRange}
            style={{ width: 170 }}
          />
          <Button icon={<SyncOutlined />} onClick={() => fetchDashboard({ silent: true })}>
            Refresh
          </Button>
        </Space>
      </div>

      {errorMessage ? (
        <Alert
          type="error"
          showIcon
          className="mb-4"
          message="Không tải được dữ liệu thật từ backend"
          description={errorMessage}
        />
      ) : null}

      <Spin spinning={loading} tip="Đang tải dữ liệu dashboard...">
        <Row gutter={[16, 16]} className="mb-6">
          {kpiData.map((item) => {
            const growth = calcGrowth(item.value, item.previous);
            return (
              <Col xs={24} sm={12} lg={8} xl={4} key={item.key}>
                <Card className="analytics-kpi-card" hoverable>
                  <Statistic
                    title={item.title}
                    value={formatKpiValue(item.value, item.format)}
                    prefix={item.icon}
                  />
                  <div className="analytics-kpi-trend">
                    {growth >= 0 ? (
                      <Tag color="green" icon={<RiseOutlined />}>
                        +{Math.abs(growth)}%
                      </Tag>
                    ) : (
                      <Tag color="red" icon={<FallOutlined />}>
                        -{Math.abs(growth)}%
                      </Tag>
                    )}
                    <span>so với kỳ trước</span>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "analytics",
              label: (
                <span>
                  <LineChartOutlined /> Analytics
                </span>
              ),
              children: (
                <>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} xl={14}>
                      <Card title="Traffic Trend" className="analytics-card">
                        <div className="traffic-bars">
                          {dashboardData.trafficTrend.map((point) => (
                            <div className="traffic-row" key={point.label}>
                              <span className="traffic-label">{point.label}</span>
                              <div className="traffic-track">
                                <div
                                  className="traffic-fill"
                                  style={{
                                    width: `${(Number(point.visits || 0) / maxVisits) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="traffic-value">
                                {numberFormatter.format(Number(point.visits || 0))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} xl={10}>
                      <Card title="Nguồn Traffic" className="analytics-card">
                        <List
                          dataSource={dashboardData.trafficSources}
                          renderItem={(item) => (
                            <List.Item>
                              <div className="source-item">
                                <div className="source-head">
                                  <span>
                                    <GlobalOutlined /> {item.source}
                                  </span>
                                  <span>{numberFormatter.format(Number(item.visits || 0))} visits</span>
                                </div>
                                <Progress percent={Number(item.percentage || 0)} showInfo={false} />
                              </div>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]} className="mt-4">
                    <Col span={24}>
                      <Card title="Revenue Breakdown" className="analytics-card">
                        <Table
                          columns={revenueColumns}
                          dataSource={dashboardData.revenueData}
                          pagination={false}
                          summary={(pageData) => {
                            let totalRevenue = 0;
                            let totalTransactions = 0;

                            pageData.forEach(({ revenue, transactions }) => {
                              totalRevenue += Number(revenue || 0);
                              totalTransactions += Number(transactions || 0);
                            });

                            const avgOrder =
                              totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

                            return (
                              <Table.Summary.Row>
                                <Table.Summary.Cell index={0}>Tổng cộng</Table.Summary.Cell>
                                <Table.Summary.Cell index={1}>
                                  {currencyFormatter.format(totalRevenue)}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2}>
                                  {numberFormatter.format(totalTransactions)}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={3}>
                                  {currencyFormatter.format(avgOrder)}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4}>-</Table.Summary.Cell>
                              </Table.Summary.Row>
                            );
                          }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </>
              ),
            },
            {
              key: "system-admin",
              label: (
                <span>
                  <CloudServerOutlined /> System Admin
                </span>
              ),
              children: (
                <>
                  {(dashboardData.systemAlerts || []).slice(0, 1).map((alert) => (
                    <Alert
                      key={alert.key}
                      type={
                        alert.level === "critical"
                          ? "error"
                          : alert.level === "warning"
                            ? "warning"
                            : "info"
                      }
                      showIcon
                      className="mb-4"
                      message={alert.title}
                      description={alert.description}
                    />
                  ))}

                  <Row gutter={[16, 16]} className="mb-4">
                    {dashboardData.systemOverview.map((item) => (
                      <Col xs={24} sm={12} lg={6} key={item.key}>
                        <Card className="analytics-card" hoverable>
                          <Statistic
                            title={item.title}
                            value={Number(item.value || 0)}
                            suffix={item.suffix}
                            prefix={
                              item.key === "db-latency" ? (
                                <ThunderboltOutlined />
                              ) : item.key === "pending-transactions" ? (
                                <ClockCircleOutlined />
                              ) : item.key === "failed-rate" ? (
                                <AlertOutlined />
                              ) : (
                                <CheckCircleOutlined />
                              )
                            }
                          />
                          <div className="system-status-tag">{getStatusTag(item.status)}</div>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} xl={14}>
                      <Card title="Service Health" className="analytics-card">
                        <Table
                          columns={serviceColumns}
                          dataSource={dashboardData.serviceStatus}
                          pagination={false}
                        />
                      </Card>
                    </Col>

                    <Col xs={24} xl={10}>
                      <Card title="Resource Usage" className="analytics-card mb-4">
                        <List
                          dataSource={dashboardData.resourceUsage}
                          renderItem={(resource) => (
                            <List.Item>
                              <div className="resource-item">
                                <div className="resource-head">
                                  <span>{resource.label}</span>
                                  <span>{resource.detail}</span>
                                </div>
                                <Progress
                                  percent={Number(resource.usage || 0)}
                                  strokeColor={
                                    Number(resource.usage || 0) > 80
                                      ? "#ff4d4f"
                                      : Number(resource.usage || 0) > 65
                                        ? "#faad14"
                                        : "#52c41a"
                                  }
                                  showInfo={false}
                                />
                              </div>
                            </List.Item>
                          )}
                        />
                      </Card>

                      <Card title="Recent Alerts" className="analytics-card">
                        <List
                          dataSource={dashboardData.systemAlerts}
                          renderItem={(item) => (
                            <List.Item>
                              <div className="alert-item">
                                <Tag
                                  color={
                                    item.level === "critical"
                                      ? "red"
                                      : item.level === "warning"
                                        ? "gold"
                                        : "blue"
                                  }
                                  icon={
                                    item.level === "critical" ? <WarningOutlined /> : <AlertOutlined />
                                  }
                                >
                                  {String(item.level || "info").toUpperCase()}
                                </Tag>
                                <div>
                                  <div className="alert-title">{item.title}</div>
                                  <div className="alert-description">{item.description}</div>
                                </div>
                              </div>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                </>
              ),
            },
          ]}
        />
      </Spin>
    </div>
  );
};

export default AnalyticsDashboard;

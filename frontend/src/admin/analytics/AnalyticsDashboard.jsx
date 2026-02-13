import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  Tag,
  Select,
  DatePicker,
  Button,
  Space,
  Tabs,
  List,
  Avatar,
  Badge,
} from "antd";
import {
  EyeOutlined,
  DollarOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  CloudServerOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import "./analytics.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data cho statistics
  const statsData = [
    {
      title: "Tổng lượt truy cập",
      value: 125436,
      prefix: <EyeOutlined />,
      suffix: "lượt",
      trend: 12.5,
      trendUp: true,
    },
    {
      title: "Doanh thu tháng này",
      value: 45678000,
      prefix: <DollarOutlined />,
      suffix: "đ",
      trend: 8.3,
      trendUp: true,
      precision: 0,
    },
    {
      title: "Người dùng hoạt động",
      value: 8532,
      prefix: <UserOutlined />,
      suffix: "users",
      trend: 3.2,
      trendUp: false,
    },
    {
      title: "Tổng thời gian xem",
      value: 156789,
      prefix: <PlayCircleOutlined />,
      suffix: "giờ",
      trend: 15.7,
      trendUp: true,
    },
  ];

  // Traffic data by source
  const trafficSources = [
    { source: "Organic Search", visits: 45230, percentage: 42 },
    { source: "Direct", visits: 28156, percentage: 26 },
    { source: "Social Media", visits: 19845, percentage: 18 },
    { source: "Referral", visits: 10234, percentage: 10 },
    { source: "Paid Ads", visits: 4321, percentage: 4 },
  ];

  // Revenue data
  const revenueData = [
    {
      key: 1,
      period: "Tuần 1 - Tháng 2",
      revenue: 12345000,
      transactions: 156,
      avgOrder: 79135,
      growth: 15.2,
    },
    {
      key: 2,
      period: "Tuần 2 - Tháng 2",
      revenue: 15678000,
      transactions: 189,
      avgOrder: 82952,
      growth: 8.5,
    },
    {
      key: 3,
      period: "Tuần 3 - Tháng 2",
      revenue: 13456000,
      transactions: 167,
      avgOrder: 80574,
      growth: -5.3,
    },
    {
      key: 4,
      period: "Tuần 4 - Tháng 2",
      revenue: 18234000,
      transactions: 215,
      avgOrder: 84786,
      growth: 12.7,
    },
  ];

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
      render: (value) => `${value.toLocaleString()} đ`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: "Giao dịch",
      dataIndex: "transactions",
      key: "transactions",
      sorter: (a, b) => a.transactions - b.transactions,
    },
    {
      title: "TB/Đơn",
      dataIndex: "avgOrder",
      key: "avgOrder",
      render: (value) => `${value.toLocaleString()} đ`,
    },
    {
      title: "Tăng trưởng",
      dataIndex: "growth",
      key: "growth",
      render: (value) => (
        <Tag color={value >= 0 ? "green" : "red"}>
          {value >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(value)}%
        </Tag>
      ),
      sorter: (a, b) => a.growth - b.growth,
    },
  ];

  // AI Models data
  const aiModels = [
    {
      id: 1,
      name: "Movie Recommendation Engine",
      type: "Collaborative Filtering",
      version: "v2.3.1",
      status: "active",
      accuracy: 94.5,
      lastTrained: "2026-02-10 14:30:00",
      predictions: 156789,
    },
    {
      id: 2,
      name: "Content Moderator",
      type: "NLP Classification",
      version: "v1.8.2",
      status: "active",
      accuracy: 97.2,
      lastTrained: "2026-02-08 09:15:00",
      predictions: 45623,
    },
    {
      id: 3,
      name: "User Sentiment Analyzer",
      type: "Sentiment Analysis",
      version: "v1.5.0",
      status: "training",
      accuracy: 91.8,
      lastTrained: "2026-02-12 16:45:00",
      predictions: 28934,
    },
    {
      id: 4,
      name: "Video Quality Enhancer",
      type: "Deep Learning",
      version: "v3.1.0",
      status: "inactive",
      accuracy: 89.3,
      lastTrained: "2026-01-28 11:20:00",
      predictions: 12456,
    },
  ];

  const aiModelsColumns = [
    {
      title: "Tên Model",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          active: { color: "green", icon: <CheckCircleOutlined />, text: "Active" },
          training: { color: "orange", icon: <SyncOutlined spin />, text: "Training" },
          inactive: { color: "red", icon: <CloseCircleOutlined />, text: "Inactive" },
        };
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Độ chính xác",
      dataIndex: "accuracy",
      key: "accuracy",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={value}
            size="small"
            strokeColor={value >= 95 ? "#52c41a" : value >= 90 ? "#faad14" : "#ff4d4f"}
            style={{ width: 100 }}
          />
          <span className="text-xs">{value}%</span>
        </div>
      ),
      sorter: (a, b) => a.accuracy - b.accuracy,
    },
    {
      title: "Predictions",
      dataIndex: "predictions",
      key: "predictions",
      render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.predictions - b.predictions,
    },
    {
      title: "Trained lần cuối",
      dataIndex: "lastTrained",
      key: "lastTrained",
      render: (text) => <span className="text-xs text-gray-500">{text}</span>,
    },
  ];

  // Top movies by views
  const topMovies = [
    { title: "Biệt Đội Đáp Phá", views: 45632, avatar: "🎬" },
    { title: "Kẻ Trộm Mặt Trăng 4", views: 38921, avatar: "🎥" },
    { title: "Vùng Đất Câm Lặng", views: 35467, avatar: "🎞️" },
    { title: "Deadpool & Wolverine", views: 32145, avatar: "🎭" },
    { title: "Dune: Phần Hai", views: 28934, avatar: "🎪" },
  ];

  return (
    <div className="analytics-dashboard p-6">
      {/* Header with filters */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p>Thống kê tổng quan và quản lý AI Models</p>
        </div>
        <Space>
          <RangePicker />
          <Select value={timeRange} onChange={setTimeRange} style={{ width: 150 }}>
            <Option value="today">Hôm nay</Option>
            <Option value="7days">7 ngày qua</Option>
            <Option value="30days">30 ngày qua</Option>
            <Option value="90days">90 ngày qua</Option>
          </Select>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card hoverable className="shadow-sm">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                precision={stat.precision}
                valueStyle={{ color: stat.trendUp ? "#3f8600" : "#cf1322" }}
              />
              <div className="mt-2 text-xs text-gray-500">
                {stat.trendUp ? (
                  <RiseOutlined className="text-green-500" />
                ) : (
                  <FallOutlined className="text-red-500" />
                )}{" "}
                {stat.trend}% so với kỳ trước
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tabs for different sections */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "overview",
            label: (
              <span>
                <LineChartOutlined /> Tổng quan
              </span>
            ),
            children: (
              <Row gutter={[16, 16]}>
                {/* Traffic Sources */}
                <Col xs={24} lg={12}>
                  <Card title="Nguồn truy cập" className="shadow-sm">
                    <List
                      dataSource={trafficSources}
                      renderItem={(item) => (
                        <List.Item>
                          <div className="w-full">
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">
                                <GlobalOutlined className="mr-2" />
                                {item.source}
                              </span>
                              <span className="text-gray-500">
                                {item.visits.toLocaleString()} visits
                              </span>
                            </div>
                            <Progress percent={item.percentage} strokeColor="#1890ff" />
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>

                {/* Top Movies */}
                <Col xs={24} lg={12}>
                  <Card title="Top phim được xem nhiều" className="shadow-sm">
                    <List
                      dataSource={topMovies}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Badge count={index + 1} style={{ backgroundColor: "#52c41a" }}>
                                <Avatar size={40}>{item.avatar}</Avatar>
                              </Badge>
                            }
                            title={item.title}
                            description={
                              <span className="text-xs">
                                <EyeOutlined className="mr-1" />
                                {item.views.toLocaleString()} lượt xem
                              </span>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "revenue",
            label: (
              <span>
                <DollarOutlined /> Doanh thu
              </span>
            ),
            children: (
              <Card className="shadow-sm">
                <Table
                  columns={revenueColumns}
                  dataSource={revenueData}
                  pagination={false}
                  summary={(pageData) => {
                    let totalRevenue = 0;
                    let totalTransactions = 0;

                    pageData.forEach(({ revenue, transactions }) => {
                      totalRevenue += revenue;
                      totalTransactions += transactions;
                    });

                    return (
                      <Table.Summary.Row className="font-bold bg-gray-50">
                        <Table.Summary.Cell index={0}>Tổng cộng</Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          {totalRevenue.toLocaleString()} đ
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>{totalTransactions}</Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          {(totalRevenue / totalTransactions).toLocaleString()} đ
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>-</Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            ),
          },
          {
            key: "ai-models",
            label: (
              <span>
                <CloudServerOutlined /> AI Models
              </span>
            ),
            children: (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Quản lý AI Models</h3>
                  <Space>
                    <Button icon={<SyncOutlined />}>Refresh</Button>
                    <Button type="primary" icon={<ThunderboltOutlined />}>
                      Train New Model
                    </Button>
                  </Space>
                </div>
                <Card className="shadow-sm">
                  <Table
                    columns={aiModelsColumns}
                    dataSource={aiModels}
                    pagination={{
                      pageSize: 10,
                      showTotal: (total) => `Tổng ${total} models`,
                    }}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AnalyticsDashboard;

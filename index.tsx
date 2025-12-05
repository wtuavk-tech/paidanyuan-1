import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { 
  Copy, 
  FileText, 
  CheckCircle, 
  Info, 
  Search, 
  AlertTriangle, 
  Trash2, 
  DollarSign, 
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Calendar,
  Send,
  User,
  Activity,
  Zap,
  LayoutDashboard,
  Wallet,
  ClipboardList,
  Bell,
  CheckSquare,
  XSquare,
  HelpCircle,
  ShieldBan
} from 'lucide-react';

// --- 类型定义 ---

enum OrderStatus {
  PendingDispatch = '待派单',
  Completed = '已完成', // 在此场景下也作为“已派单”的状态
  Void = '作废',
  Returned = '已退回',
  Error = '报错'
}

// 派单紧急状态
enum DispatchStatus {
  Normal = '正常',
  Urgent = '催单',
  Timeout = '已超时'
}

// 派单方式
enum DispatchMethod {
  Grab = '抢单',
  Negotiate = '谈单'
}

interface Order {
  id: number;
  orderNo: string;
  workOrderNo: string;
  dispatchTime: string;
  mobile: string;
  serviceItem: string;
  serviceRatio: '3:7' | '2:8' | '4:6'; 
  status: OrderStatus;
  returnReason?: string; 
  errorDetail?: string; 
  region: string;
  address: string;
  details: string;
  recordTime: string;
  source: string;
  totalAmount: number; 
  cost: number;        
  hasAdvancePayment: boolean; 
  depositAmount?: number;
  weightedCoefficient: number;
  regionPeople: number;
  // 新增字段
  dispatchStatus: DispatchStatus;
  dispatchMethod: DispatchMethod;
  marketPrice: number;       // 划线价
  historyPriceLow: number;   // 历史成交低价
  historyPriceHigh: number;  // 历史成交高价
}

// --- 自动生成 128 条 Mock 数据 ---
const generateMockData = (): Order[] => {
  const services = ['家庭保洁日常', '深度家电清洗', '甲醛治理', '玻璃清洗', '管道疏通', '空调清洗', '开荒保洁', '收纳整理', '沙发清洗'];
  const regions = ['北京市/朝阳区', '上海市/浦东新区', '深圳市/南山区', '杭州市/西湖区', '成都市/武侯区', '广州市/天河区', '武汉市/江汉区', '南京市/鼓楼区'];
  const sources = ['小程序', '电话', '美团', '转介绍', '抖音', '58同城'];
  const coefficients = [1.0, 1.1, 1.2, 1.3, 1.5];
  
  let pendingCount = 0;

  return Array.from({ length: 128 }).map((_, i) => {
    const id = i + 1;
    
    let status = OrderStatus.Completed;
    let returnReason = undefined;
    let errorDetail = undefined;

    // 增加更多待派单数据以展示排序效果
    if (i % 5 === 0) { 
      status = OrderStatus.PendingDispatch;
      pendingCount++;
    } else if (i % 15 === 1) {
      status = OrderStatus.Void;
    } else if (i % 15 === 2) {
      status = OrderStatus.Returned;
      returnReason = '客户改期/联系不上';
    } else if (i % 15 === 3) {
      status = OrderStatus.Error;
      errorDetail = '现场与描述不符，需加价';
    } else {
      status = OrderStatus.Completed;
    }

    // 生成派单状态：增加催单和超时的比例
    let dispatchStatus = DispatchStatus.Normal;
    if (status === OrderStatus.PendingDispatch) {
        const r = Math.random();
        if (r > 0.6) dispatchStatus = DispatchStatus.Timeout;
        else if (r > 0.3) dispatchStatus = DispatchStatus.Urgent;
    }

    const baseAddress = `${['阳光', '幸福', '金地', '万科', '恒大'][i % 5]}花园 ${i % 20 + 1}栋 ${i % 30 + 1}0${i % 4 + 1}室`;
    const extraInfo = `(需联系物业核实车位情况)`;
    const baseDetails = ['需带梯子，层高3.5米，有大型犬', '有宠物，需要发票，客户要求穿鞋套', '尽量上午，客户下午要出门', '需带吸尘器，重点清理地毯', '刚装修完，灰尘较大'][i % 5];
    
    const serviceItem = services[i % services.length];
    const isHighValue = serviceItem.includes('深度') || serviceItem.includes('甲醛') || serviceItem.includes('开荒');
    
    const marketPrice = isHighValue ? 300 + (i % 10) * 20 : 100 + (i % 5) * 10;
    const historyLow = Math.floor(marketPrice * 0.8);
    const historyHigh = Math.floor(marketPrice * 1.2);

    return {
      id,
      orderNo: `ORD-20231027-${String(id).padStart(4, '0')}`,
      workOrderNo: `WO-${9980 + id}`,
      dispatchTime: `10-${27 + Math.floor(i/30)} ${String(8 + (i % 10)).padStart(2, '0')}:${String((i * 5) % 60).padStart(2, '0')}`,
      mobile: `13${i % 9 + 1}****${String(1000 + i).slice(-4)}`,
      serviceItem: serviceItem,
      serviceRatio: (['3:7', '4:6', '2:8'][i % 3]) as any,
      status,
      returnReason,
      errorDetail,
      region: regions[i % regions.length],
      address: baseAddress, 
      details: `${baseDetails} ${extraInfo}`,
      recordTime: `10-27 08:${String(i % 60).padStart(2, '0')}`,
      source: sources[i % sources.length],
      totalAmount: 150 + (i % 20) * 20,
      cost: (150 + (i % 20) * 20) * (i % 2 === 0 ? 0.6 : 0.7),
      hasAdvancePayment: i % 7 === 0,
      depositAmount: i % 12 === 0 ? 50 : undefined,
      weightedCoefficient: coefficients[i % coefficients.length],
      regionPeople: Math.floor(Math.random() * 6),
      dispatchStatus,
      dispatchMethod: isHighValue ? DispatchMethod.Negotiate : DispatchMethod.Grab,
      marketPrice,
      historyPriceLow: historyLow,
      historyPriceHigh: historyHigh,
    };
  });
};

// --- 组件部分 ---

const BlockStat = ({ label, value, color = "text-slate-700", highlight = false }: { label: string, value: string | number, color?: string, highlight?: boolean }) => (
  <div className="flex flex-col items-center justify-center border border-blue-100/50 rounded-lg px-3 py-1 flex-1 h-[64px] transition-all hover:bg-blue-50/50 hover:border-blue-200 shadow-sm bg-white/40">
    <span className="text-sm font-bold text-slate-500 mb-1">{label}</span>
    <span className={`font-mono font-extrabold ${highlight ? 'text-emerald-600' : color} text-2xl leading-none tracking-tight`}>{value}</span>
  </div>
);

const NotificationBar = () => {
  return (
    <div className="flex items-center gap-4 mb-3 px-4 py-2 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-100 rounded-lg shadow-sm overflow-hidden relative group/marquee">
      <div className="flex items-center gap-2 text-orange-600 shrink-0 z-10 bg-inherit pr-2">
        <div className="relative">
          <Bell size={18} className="animate-[wiggle_1s_ease-in-out_infinite]" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-orange-50"></div>
        </div>
        <span className="text-xs font-bold whitespace-nowrap">系统公告</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative h-6 flex items-center">
        <div className="whitespace-nowrap animate-[marquee_25s_linear_infinite] group-hover/marquee:[animation-play-state:paused] flex items-center gap-8 text-xs font-medium text-slate-700 cursor-default">
          <span>🔥 <span className="font-bold text-orange-600">紧急通知：</span>系统将于今晚 02:00 进行例行维护，预计耗时 15 分钟，请提前保存数据。</span>
          <span>🏆 <span className="font-bold text-blue-600">喜报：</span>恭喜上海浦东区张师傅获得本月“服务之星”称号，奖励现金 500 元！</span>
          <span>📢 <span className="font-bold text-emerald-600">新功能上线：</span>“一键快找”功能已优化，支持按地域和项目模糊搜索，欢迎体验。</span>
          <span>⚠️ <span className="font-bold text-red-600">提醒：</span>近期多雨天气，请各位师傅外出注意安全，带好雨具。</span>
        </div>
      </div>

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

const SearchPanel = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
  const [timeType, setTimeType] = useState('create');
  const [personType, setPersonType] = useState('order');
  const [otherType, setOtherType] = useState('status');

  const stats = {
    record: { total: 128, error: 3, all: 135, afterSales: 5, refund: '450.5' },
    dispatch: { today: 42, past: 86, other: 12, self: 30, single: 8, none: 2 },
    perf: { rate: '98.5%', today: '12850.0', wechat: '5600.0', platform: '7250.0', offline: '0' }
  };

  const ActionButton = ({ icon: Icon, label, colorClass }: { icon: any, label: string, colorClass: string }) => (
    <button className={`h-7 px-2.5 ${colorClass} text-white text-[11px] rounded shadow-sm flex items-center gap-1 transition-all active:scale-95 font-medium whitespace-nowrap`}>
      <Icon size={12} /> {label}
    </button>
  );

  return (
    <div className={`shadow-lg mb-3 transition-all duration-300 ease-out relative overflow-hidden border border-blue-100 rounded-lg bg-gradient-to-br from-[#f0f7ff] via-[#e6f4ff] to-[#dbeafe]`}>
      
      {!isOpen && (
        <div className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors group" onClick={onToggle}>
          <div className="flex items-center gap-2 text-slate-600">
             <LayoutDashboard size={16} className="text-blue-500" />
             <span className="text-xs font-bold text-slate-700">数据与高级筛选</span>
             <span className="text-[10px] text-slate-400">点击展开详细数据看板与搜索条件</span>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      )}
      
      {isOpen && (
        <div className="flex min-h-[260px] animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* LEFT PANEL: DATA OVERVIEW (66%) */}
          <div className="w-[66%] p-5 border-r border-blue-200/60 flex flex-col relative backdrop-blur-sm bg-white/30">
             <div className="flex items-center gap-2 mb-4 h-6"> 
                <Activity size={18} className="text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">数据概览</h3>
             </div>

             <div className="space-y-4 flex-1 flex flex-col justify-center"> 
               <div className="flex items-center gap-4 h-[64px]"> 
                  <div className="flex items-center gap-2 text-blue-600 w-[80px] justify-end shrink-0">
                    <ClipboardList size={16} />
                    <span className="text-sm font-bold">订单情况</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 w-full">
                    <BlockStat label="录单数" value={stats.record.total} />
                    <BlockStat label="报错数" value={stats.record.error} color="text-red-500" />
                    <BlockStat label="总单数" value={stats.record.all} />
                    <BlockStat label="待售后" value={stats.record.afterSales} color="text-orange-500" />
                    <BlockStat label="退款额" value={stats.record.refund} />
                  </div>
               </div>

               <div className="flex items-center gap-4 h-[64px]">
                  <div className="flex items-center gap-2 text-cyan-600 w-[80px] justify-end shrink-0">
                    <Zap size={16} />
                    <span className="text-sm font-bold">派单详情</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 w-full">
                    <BlockStat label="今日派单" value={stats.dispatch.today} />
                    <BlockStat label="往日派单" value={stats.dispatch.past} />
                    <BlockStat label="他派" value={stats.dispatch.other} />
                    <BlockStat label="自派" value={stats.dispatch.self} />
                    <BlockStat label="单库" value={stats.dispatch.single} />
                    <BlockStat label="未派" value={stats.dispatch.none} color="text-slate-400" />
                  </div>
               </div>

               <div className="flex items-center gap-4 h-[64px]">
                  <div className="flex items-center gap-2 text-indigo-600 w-[80px] justify-end shrink-0">
                    <Wallet size={16} />
                    <span className="text-sm font-bold">业绩指标</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 w-full">
                     <BlockStat label="收款率" value={stats.perf.rate} />
                     <BlockStat label="今日业绩" value={stats.perf.today} highlight />
                     <BlockStat label="今日微信" value={stats.perf.wechat} />
                     <BlockStat label="平台" value={stats.perf.platform} />
                     <BlockStat label="线下" value={stats.perf.offline} />
                  </div>
               </div>
             </div>
          </div>

          {/* RIGHT PANEL: SEARCH & FILTERS (34%) */}
          <div className="w-[34%] p-4 flex flex-col relative backdrop-blur-sm bg-white/60">
             <div className="flex flex-col gap-3 mb-4">
                <div className="flex justify-between items-center h-8">
                    <div className="flex items-center gap-2">
                       <Search size={16} className="text-blue-600" />
                       <h3 className="text-sm font-bold text-slate-800">高级筛选</h3>
                    </div>
                    <button onClick={onToggle} className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-all">
                        <ChevronUp size={12} /> 收起
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                   <ActionButton icon={Plus} label="录单" colorClass="bg-blue-600 hover:bg-blue-700" />
                   <ActionButton icon={Zap} label="快找" colorClass="bg-[#6366f1] hover:bg-[#4f46e5]" />
                   <ActionButton icon={CheckSquare} label="批量完成" colorClass="bg-emerald-600 hover:bg-emerald-700" />
                   <ActionButton icon={XSquare} label="批量作废" colorClass="bg-slate-500 hover:bg-slate-600" />
                   <ActionButton icon={HelpCircle} label="存疑号码" colorClass="bg-orange-500 hover:bg-orange-600" />
                   <ActionButton icon={ShieldBan} label="黑名单" colorClass="bg-red-600 hover:bg-red-700" />
                </div>
             </div>

             <div className="space-y-3 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 bg-white border border-blue-100 p-1 rounded hover:border-blue-300 transition-colors shadow-sm h-[42px]">
                  <div className="text-blue-400 px-1"><Calendar size={16} /></div>
                  <div className="relative">
                    <select 
                      value={timeType}
                      onChange={(e) => setTimeType(e.target.value)}
                      className="h-8 pl-1 pr-5 border-none bg-transparent text-xs font-bold text-slate-700 focus:ring-0 appearance-none cursor-pointer outline-none w-[84px]"
                    >
                      <option value="create">创建时间</option>
                      <option value="finish">完成时间</option>
                      <option value="payment">收款时间</option>
                      <option value="service">服务时间</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-0 top-2.5 text-slate-400 pointer-events-none"/>
                  </div>
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                     <input type="datetime-local" className="bg-transparent text-[10px] text-slate-600 outline-none flex-1 px-0 min-w-0 h-full" />
                     <span className="text-slate-300">-</span>
                     <input type="datetime-local" className="bg-transparent text-[10px] text-slate-600 outline-none flex-1 px-0 min-w-0 h-full" />
                  </div>
                </div>

                <div className="flex gap-2 h-[42px]">
                    <div className="flex-[1.2] flex items-center gap-1 bg-white border border-blue-100 p-1 rounded hover:border-blue-300 transition-colors shadow-sm min-w-0">
                      <div className="text-blue-400 px-1 shrink-0"><User size={16} /></div>
                      <div className="relative shrink-0">
                        <select 
                          value={personType}
                          onChange={(e) => setPersonType(e.target.value)}
                          className="h-8 pl-1 pr-3 border-none bg-transparent text-xs font-bold text-slate-700 focus:ring-0 appearance-none cursor-pointer outline-none w-[50px]"
                        >
                          <option value="order">综合</option>
                          <option value="master">师傅</option>
                          <option value="dispatcher">派单</option>
                        </select>
                      </div>
                      <div className="flex-1 h-full min-w-0">
                         <input type="text" className="bg-transparent text-xs text-slate-600 outline-none w-full h-full px-1 placeholder-slate-400 border-l border-slate-100" placeholder="关键字" />
                      </div>
                    </div>

                    <div className="flex-1 flex items-center gap-1 bg-white border border-blue-100 p-1 rounded hover:border-blue-300 transition-colors shadow-sm min-w-0">
                      <div className="relative shrink-0">
                        <select 
                          value={otherType}
                          onChange={(e) => setOtherType(e.target.value)}
                          className="h-8 pl-2 pr-3 border-none bg-transparent text-xs font-bold text-slate-700 focus:ring-0 appearance-none cursor-pointer outline-none w-[60px]"
                        >
                          <option value="status">状态</option>
                          <option value="service">项目</option>
                          <option value="region">地域</option>
                        </select>
                      </div>
                      <div className="flex-1 h-full min-w-0">
                         {otherType === 'status' ? (
                           <div className="relative w-full h-full">
                              <select className="h-full w-full px-1 border-l border-slate-100 text-xs text-slate-600 focus:outline-none bg-transparent appearance-none cursor-pointer">
                                <option value="">全部</option>
                                <option value="PendingDispatch">待派单</option>
                                <option value="Completed">已完成</option>
                              </select>
                           </div>
                         ) : (
                           <input type="text" className="bg-transparent text-xs text-slate-600 outline-none w-full h-full px-1 placeholder-slate-400 border-l border-slate-100" placeholder="输入" />
                         )}
                      </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 h-[42px]">
                    <button className="h-8 flex-1 bg-white text-slate-600 hover:text-blue-600 text-xs rounded transition-colors border border-slate-200 hover:border-blue-300 shadow-sm font-medium">
                        重置
                    </button>
                    <button onClick={onToggle} className="h-8 flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs rounded transition-all font-bold shadow-md flex items-center gap-2 active:scale-95 justify-center">
                        <Search size={14} /> 立即搜索
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TooltipCell = ({ content, maxWidthClass = "max-w-[100px]", showTooltip }: { content: string, maxWidthClass?: string, showTooltip: boolean }) => {
  return (
    <div className={`relative ${maxWidthClass}`}>
      <div className="truncate text-[10px] leading-tight text-gray-600 cursor-default">
        {content}
      </div>
      {showTooltip && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-gray-800 text-white text-xs p-3 rounded shadow-lg z-[70] whitespace-normal break-words animate-in fade-in duration-150">
          {content}
          <div className="absolute bottom-full left-4 border-4 border-transparent border-b-gray-800"></div>
        </div>
      )}
    </div>
  );
}

const ServiceItemCell = ({ item }: { item: string }) => {
  return (
    <div className="py-1">
      <span className="font-bold text-gray-700 hover:text-blue-600 cursor-default transition-colors">
        {item}
      </span>
    </div>
  );
};

const StatusCell = ({ order }: { order: Order }) => {
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PendingDispatch: return 'bg-orange-100 text-orange-700 border border-orange-200';
      case OrderStatus.Returned: return 'bg-red-100 text-red-700 border border-red-200';
      case OrderStatus.Error: return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case OrderStatus.Void: return 'bg-gray-100 text-gray-500 border border-gray-200';
      case OrderStatus.Completed: return 'bg-green-100 text-green-700 border border-green-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-start justify-center h-full">
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${getStatusStyle(order.status)}`}>
        {order.status}
      </span>
      {order.status === OrderStatus.Returned && order.returnReason && (
        <span className="text-[10px] text-red-500 mt-0.5 max-w-[140px] leading-tight text-left block">
          {order.returnReason}
        </span>
      )}
      {order.status === OrderStatus.Error && order.errorDetail && (
        <div className="mt-0.5 flex flex-col items-start">
          <span className="text-[10px] text-yellow-700 bg-yellow-50 px-1 py-0 rounded border border-yellow-200 max-w-[140px] truncate block" title={order.errorDetail}>
            {order.errorDetail}
          </span>
        </div>
      )}
    </div>
  );
};

// DispatchCell: 包含派单按钮、复制功能和闪烁提示
const DispatchCell = ({ order, isFirstRow, onDispatch }: { order: Order, isFirstRow: boolean, onDispatch: (id: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFlashVisible, setIsFlashVisible] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const menuElement = document.getElementById(`dispatch-popover-${order.id}`);
        if (menuElement && !menuElement.contains(event.target as Node)) {
             setIsOpen(false);
        }
      }
    };
    const handleScroll = () => { if(isOpen) setIsOpen(false); }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true); 
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, order.id]);

  const togglePopover = () => {
    // 点击派单按钮时，隐藏闪烁提示
    setIsFlashVisible(false);
    
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 5,
        left: rect.left - 20 // 调整一下弹出位置
      });
    }
    setIsOpen(!isOpen);
  };

  const handleCopyAndClose = async (type: string) => {
    const text = `订单号：${order.orderNo}\n手机号：${order.mobile}\n服务项目：${order.serviceItem}\n地域：${order.region}\n详细地址：${order.address}\n详情：${order.details}`;
    try {
        await navigator.clipboard.writeText(text);
        // 这里可以加一个 Toast 提示，目前为了简洁直接关闭
        
        // 关键逻辑：调用父组件回调，更新状态为已派单
        onDispatch(order.id);
    } catch (err) {
        console.error("Copy failed");
    }
    setIsOpen(false);
  };

  if (order.status === OrderStatus.PendingDispatch) {
    const isUrgent = order.dispatchStatus === DispatchStatus.Urgent;
    const isTimeout = order.dispatchStatus === DispatchStatus.Timeout;
    const showFlash = isFlashVisible && (isUrgent || isTimeout);

    return (
      <div className="relative inline-block">
        {/* 闪动文字提示 */}
        {showFlash && (
            <div className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap z-10 animate-bounce ${isFirstRow ? '-top-6' : '-top-5'}`}>
                <span className={`text-[10px] font-bold px-1 rounded bg-white/95 border shadow-sm ${isUrgent ? 'text-orange-500 border-orange-200' : 'text-red-600 border-red-200'}`}>
                    {order.dispatchStatus}
                </span>
            </div>
        )}

        <button 
          ref={buttonRef}
          onClick={togglePopover}
          className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] rounded shadow-sm font-medium transition-colors min-w-[50px] relative"
        >
          派单
        </button>

        {isOpen && createPortal(
          <div 
            id={`dispatch-popover-${order.id}`}
            className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-slate-200 p-2 w-32 animate-in fade-in zoom-in-95 duration-150"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <div className="flex flex-col gap-1">
                <button 
                  onClick={() => handleCopyAndClose('offline')}
                  className="text-[11px] py-2 px-2 text-left rounded hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  线下派单
                </button>
                <button 
                  onClick={() => handleCopyAndClose('online')}
                  className="text-[11px] py-2 px-2 text-left rounded hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  线上派单
                </button>
                <div className="text-[9px] text-gray-400 text-center pt-1 border-t border-slate-100 mt-1">
                    点击即复制信息
                </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }
  return (
    <span className="text-[10px] text-gray-400 font-medium select-none">
      已派单
    </span>
  );
};

const OrderNoCell = ({ orderNo, hasAdvancePayment, depositAmount }: { orderNo: string; hasAdvancePayment: boolean; depositAmount?: number }) => {
  return (
    <div className="relative group flex flex-col items-start gap-0.5 justify-center h-full">
      <span className="text-gray-900 font-medium select-all font-mono tracking-tight">{orderNo}</span>
      <div className="flex gap-1">
        {hasAdvancePayment && (
          <span className="bg-rose-500 text-white text-[10px] px-1 py-0 rounded shadow-sm whitespace-nowrap">
            已垫款
          </span>
        )}
        {depositAmount && depositAmount > 0 && (
          <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] px-1 py-0 rounded shadow-sm whitespace-nowrap">
            定金{depositAmount}
          </span>
        )}
      </div>
    </div>
  );
};

const ActionCell = ({ orderId, onAction }: { orderId: number; onAction: (action: string, id: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const menuElement = document.getElementById(`action-menu-${orderId}`);
        if (menuElement && !menuElement.contains(event.target as Node)) {
             setIsOpen(false);
        }
      }
    };
    const handleScroll = () => { if(isOpen) setIsOpen(false); }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true); 
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, orderId]);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 5,
        left: rect.right - 128
      });
    }
    setIsOpen(!isOpen);
  };

  const handleActionClick = (actionName: string) => {
    setIsOpen(false);
    onAction(actionName, orderId);
  };

  const menuItems = [
    { name: '复制订单', icon: Copy, color: 'text-gray-600' },
    { name: '开票', icon: FileText, color: 'text-blue-600' },
    { name: '完单', icon: CheckCircle, color: 'text-green-600' },
    { name: '详情', icon: Info, color: 'text-gray-600' },
    { name: '查资源', icon: Search, color: 'text-purple-600' },
    { name: '添加报错', icon: AlertTriangle, color: 'text-orange-600' },
    { name: '作废', icon: Trash2, color: 'text-red-600' },
    { name: '其他收款', icon: DollarSign, color: 'text-teal-600' },
  ];

  return (
    <>
      <button ref={buttonRef} onClick={toggleMenu} className={`px-2 py-1 rounded text-[10px] font-medium transition-all flex items-center justify-center gap-0.5 border ${isOpen ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300'}`}>
        操作 <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && createPortal(
        <div id={`action-menu-${orderId}`} className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 w-32" style={{ top: menuPosition.top, left: menuPosition.left }}>
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button key={index} onClick={() => handleActionClick(item.name)} className="w-full text-left px-3 py-2 text-xs flex items-center hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                <item.icon size={13} className={`mr-2 transition-transform group-hover:scale-110 ${item.color}`} />
                <span className="text-gray-700 font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

const ChatModal = ({ isOpen, onClose, role, order }: { isOpen: boolean; onClose: () => void; role: string; order: Order | null }) => {
  if (!isOpen || !order) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-[600px] h-[500px] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
          <div><h3 className="font-bold text-slate-800">联系{role}</h3><p className="text-xs text-slate-500 mt-1">订单: {order.orderNo}</p></div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
        </div>
        <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
          <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">{role[0]}</div><div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm text-sm text-slate-700 max-w-[80%]">您好，我是{role}。</div></div>
        </div>
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2"><input type="text" placeholder="输入消息..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none" /><button className="bg-blue-600 text-white px-4 py-2 rounded-lg"><Send size={18} /></button></div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const CompleteOrderModal = ({ isOpen, onClose, order }: { isOpen: boolean; onClose: () => void; order: Order | null }) => {
  if (!isOpen || !order) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white w-[500px] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white"><h3 className="text-xl font-bold">完成订单</h3></div>
          <div className="p-6 space-y-4">
             <div className="flex justify-between text-sm"><span className="text-slate-500">应收金额</span><span className="font-bold text-lg text-emerald-600">¥{order.totalAmount}</span></div>
             <input type="number" defaultValue={order.totalAmount} className="w-full border border-slate-300 rounded-lg p-2" />
          </div>
          <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-slate-600">取消</button>
             <button onClick={onClose} className="px-6 py-2 bg-green-600 text-white rounded-lg">确认完成</button>
          </div>
       </div>
    </div>,
    document.body
  );
};

const App = () => {
  // 使用 State 管理订单数据，以支持动态更新
  const [orders, setOrders] = useState<Order[]>(generateMockData());
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20; 
  
  // 派单处理回调
  const handleDispatch = (id: number) => {
      setOrders(prevOrders => prevOrders.map(o => {
          if (o.id === id) {
              return {
                  ...o,
                  status: OrderStatus.Completed, // 更新为已派单/已完成状态
                  dispatchStatus: DispatchStatus.Normal // 移除紧急状态
              };
          }
          return o;
      }));
  };

  const sortedData = [...orders].sort((a, b) => {
    // 优先级评分：催单(3) > 已超时(2) > 正常(1) > 其他(0)
    const getUrgencyScore = (status: DispatchStatus, orderStatus: OrderStatus) => {
        if (orderStatus !== OrderStatus.PendingDispatch) return 0;
        if (status === DispatchStatus.Urgent) return 3;
        if (status === DispatchStatus.Timeout) return 2;
        return 1;
    };

    const scoreA = getUrgencyScore(a.dispatchStatus, a.status);
    const scoreB = getUrgencyScore(b.dispatchStatus, b.status);

    if (scoreA !== scoreB) return scoreB - scoreA; // 降序排列

    return 0;
  });

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  const [chatState, setChatState] = useState<{isOpen: boolean; role: string; order: Order | null;}>({ isOpen: false, role: '', order: null });
  const [hoveredTooltipCell, setHoveredTooltipCell] = useState<{rowId: number, colKey: 'address' | 'details'} | null>(null);

  const handleAction = (action: string, id: number) => {
    const order = sortedData.find(o => o.id === id);
    if (!order) return;
    if (action === '完单') { setCurrentOrder(order); setCompleteModalOpen(true); } 
    else { alert(`已执行操作：${action} (订单ID: ${id})`); }
  };

  const handleOpenChat = (role: string, order: Order) => { setChatState({ isOpen: true, role, order }); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleMouseEnterOther = () => { setHoveredTooltipCell(null); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 p-6 flex flex-col">
      <div className="max-w-[1800px] mx-auto w-full flex-1 flex flex-col">
        
        <NotificationBar />

        <SearchPanel isOpen={isSearchOpen} onToggle={() => setIsSearchOpen(!isSearchOpen)} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 shadow-sm bg-slate-50">
                <tr className="bg-slate-50 border-b-2 border-gray-300 text-xs font-bold uppercase text-slate-700 tracking-wider">
                  <th className="px-2 py-2 whitespace-nowrap">手机号</th>
                  <th className="px-2 py-2 min-w-[120px] whitespace-nowrap">服务项目</th>
                  <th className="px-2 py-2 whitespace-nowrap">状态</th>
                  <th className="px-2 py-2 whitespace-nowrap text-center">加权系数</th> 
                  <th className="px-2 py-2 whitespace-nowrap">地域</th>
                  <th className="px-2 py-2 max-w-[100px] whitespace-nowrap">详细地址</th> 
                  <th className="px-2 py-2 max-w-[140px] whitespace-nowrap">详情</th>
                  
                  <th className="px-2 py-2 whitespace-nowrap">建议分成</th>
                  <th className="px-2 py-2 whitespace-nowrap">建议派单方式</th>
                  <th className="px-2 py-2 whitespace-nowrap">划线价/历史价</th>
                  
                  <th className="px-2 py-2 whitespace-nowrap">来源</th>
                  <th className="px-2 py-2 min-w-[160px] whitespace-nowrap">订单号</th>
                  <th className="px-2 py-2 whitespace-nowrap">工单号</th>
                  <th className="px-2 py-2 whitespace-nowrap">录单时间</th> 
                  <th className="px-2 py-2 whitespace-nowrap">派单时间</th>
                  <th className="px-2 py-2 whitespace-nowrap text-center">联系人</th>
                  
                  {/* 派单列 */}
                  <th className="px-2 py-2 whitespace-nowrap text-center">派单</th> 
                  
                  <th className="px-2 py-2 text-center sticky right-0 bg-slate-50 shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.05)] z-10 whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {currentData.map((order, index) => {
                  const isFirstRow = index === 0;
                  return (
                    <tr 
                        key={order.id} 
                        onMouseLeave={handleMouseEnterOther} 
                        className={`bg-white even:bg-blue-50 hover:!bg-blue-100 transition-colors group text-xs border-b border-gray-300 last:border-0 align-middle ${isFirstRow ? 'h-16' : ''}`}
                    >
                        <td className={`px-2 py-2 text-slate-800 font-bold tabular-nums whitespace-nowrap align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>{order.mobile}</td>
                        <td className={`px-2 py-2 align-middle whitespace-nowrap ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>
                        <ServiceItemCell item={order.serviceItem} />
                        </td>
                        <td className={`px-2 py-2 align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>
                        <StatusCell order={order} />
                        </td>
                        <td className={`px-2 py-2 text-center font-mono text-slate-600 font-medium align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>{order.weightedCoefficient.toFixed(1)}</td>
                        <td className={`px-2 py-2 text-slate-700 whitespace-nowrap align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>
                            <div className="relative pr-8"> 
                                {order.region}
                                <span className="absolute bottom-0 right-0 text-[9px] text-blue-600 border border-blue-200 bg-blue-50 px-1 rounded">
                                {order.regionPeople}人
                                </span>
                            </div>
                        </td>
                        <td className={`px-2 py-2 align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'address'})}>
                        <TooltipCell content={order.address} maxWidthClass="max-w-[100px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'address'} />
                        </td>
                        <td className={`px-2 py-2 align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'details'})}>
                        <TooltipCell content={order.details} maxWidthClass="max-w-[140px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'details'} />
                        </td>
                        
                        <td className={`px-2 py-2 font-medium text-yellow-600 align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>
                            {order.serviceRatio}
                        </td>
                        <td className={`px-2 py-2 align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${order.dispatchMethod === DispatchMethod.Grab ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>
                                {order.dispatchMethod}
                            </span>
                        </td>
                        <td className={`px-2 py-2 font-mono text-[11px] align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>
                            <span className="text-slate-400 line-through mr-2">{order.marketPrice}</span>
                            <span className="text-slate-700">{order.historyPriceLow}-{order.historyPriceHigh}</span>
                        </td>

                        <td className={`px-2 py-2 align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}><span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] border border-slate-200 whitespace-nowrap font-medium">{order.source}</span></td>
                        <td className={`px-2 py-2 align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}><OrderNoCell orderNo={order.orderNo} hasAdvancePayment={order.hasAdvancePayment} depositAmount={order.depositAmount} /></td>
                        <td className={`px-2 py-2 text-slate-500 font-mono text-[10px] whitespace-nowrap align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>{order.workOrderNo}</td>
                        <td className={`px-2 py-2 text-slate-400 text-[10px] whitespace-nowrap tabular-nums align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>{order.recordTime}</td>
                        <td className={`px-2 py-2 text-slate-500 text-[10px] whitespace-nowrap tabular-nums align-middle ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>{order.dispatchTime}</td>
                        <td className={`px-2 py-2 align-middle text-center ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}><div className="flex flex-row gap-1 justify-center items-center"><button onClick={() => handleOpenChat('客服', order)} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium">客服</button><button onClick={() => handleOpenChat('运营', order)} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium">运营</button><button onClick={() => handleOpenChat('售后', order)} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium">售后</button></div></td>
                        
                        {/* Dispatch Action (Special handling for flash text in first row) */}
                        <td className={`px-2 py-2 text-center whitespace-nowrap ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}>
                            <DispatchCell order={order} isFirstRow={isFirstRow} onDispatch={handleDispatch} />
                        </td>
                        
                        <td className={`px-2 py-2 text-center sticky right-0 bg-slate-50 shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.05)] z-10 whitespace-nowrap ${isFirstRow ? 'pt-6' : ''}`} onMouseEnter={handleMouseEnterOther}><ActionCell orderId={order.id} onAction={handleAction} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex justify-between items-center">
             <span className="text-xs text-slate-500 font-medium">显示 {((currentPage - 1) * pageSize) + 1} 到 {Math.min(currentPage * pageSize, totalItems)} 条，共 {totalItems} 条订单</span>
             <div className="flex gap-1.5">
               <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1 border border-slate-200 rounded-md bg-white text-slate-600 text-xs hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm">上一页</button>
               <button className="px-3 py-1 border border-blue-600 rounded-md bg-blue-600 text-white text-xs font-bold shadow-md">{currentPage}</button>
               <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 border border-slate-200 rounded-md bg-white text-slate-600 text-xs hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm">下一页</button>
             </div>
          </div>
        </div>
      </div>
      <CompleteOrderModal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} order={currentOrder} />
      <ChatModal isOpen={chatState.isOpen} onClose={() => setChatState(prev => ({ ...prev, isOpen: false }))} role={chatState.role} order={chatState.order} />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
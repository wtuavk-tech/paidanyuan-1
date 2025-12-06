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
  ShieldBan,
  ArrowRightLeft,
  Edit,
  Ban,
  Users,
  Clock,
  MapPin
} from 'lucide-react';

// --- 类型定义 ---

enum OrderStatus {
  PendingDispatch = '待派单',
  Completed = '已完成',
  Void = '作废',
  Returned = '已退回',
  Error = '报错'
}

enum DispatchStatus {
  Normal = '正常',
  Urgent = '催单',
  Timeout = '已超时'
}

enum DispatchMethod {
  Grab = '抢单',
  Negotiate = '谈单'
}

interface Order {
  id: number;
  orderNo: string;
  workOrderNo: string;
  expectedTime: string; 
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
  dispatchStatus: DispatchStatus;
  dispatchMethod: DispatchMethod;
  marketPrice: number;       
  historyPriceLow: number;   
  historyPriceHigh: number;  
}

// --- Mock Data ---
const generateMockData = (): Order[] => {
  const services = ['家庭保洁日常', '深度家电清洗', '甲醛治理', '玻璃清洗', '管道疏通', '空调清洗', '开荒保洁', '收纳整理', '沙发清洗'];
  const regions = ['北京市/朝阳区', '上海市/浦东新区', '深圳市/南山区', '杭州市/西湖区', '成都市/武侯区', '广州市/天河区', '武汉市/江汉区', '南京市/鼓楼区'];
  const sources = ['小程序', '电话', '美团', '转介绍', '抖音', '58同城'];
  const coefficients = [1.0, 1.1, 1.2, 1.3, 1.5];
  
  return Array.from({ length: 128 }).map((_, i) => {
    const id = i + 1;
    let status = OrderStatus.Completed;
    let returnReason = undefined;
    let errorDetail = undefined;

    if (i % 5 === 0) status = OrderStatus.PendingDispatch;
    else if (i % 15 === 1) status = OrderStatus.Void;
    else if (i % 15 === 2) { status = OrderStatus.Returned; returnReason = '客户改期/联系不上'; }
    else if (i % 15 === 3) { status = OrderStatus.Error; errorDetail = '现场与描述不符，需加价'; }

    let dispatchStatus = DispatchStatus.Normal;
    if (status === OrderStatus.PendingDispatch) {
        const r = Math.random();
        if (r > 0.6) dispatchStatus = DispatchStatus.Timeout;
        else if (r > 0.3) dispatchStatus = DispatchStatus.Urgent;
    }

    const baseAddress = `${['阳光', '幸福', '金地', '万科', '恒大'][i % 5]}花园 ${i % 20 + 1}栋 ${i % 30 + 1}0${i % 4 + 1}室`;
    // 增加详细地址内容，使其能显示为2行
    const addressDetail = ['(靠近东门门岗，需刷卡)', '(楼下有快递柜，电梯需梯控)', '(小区正在施工，请从北门进)', '(大堂右转第一部电梯)', '(物业处登记后进入)'][i % 5];
    const fullAddress = `${baseAddress} ${addressDetail}`;

    const extraInfo = `(需联系物业核实车位情况)`;
    const baseDetails = [
        '客户备注：需带3米梯子，家里有大型犬请注意安全。另外需要重点清理厨房油烟机死角。', 
        '特殊要求：家里有孕妇，请使用无刺激性清洁剂。进门请穿鞋套，需要开具增值税发票。', 
        '时间要求：尽量上午10点前到达，下午客户要出门。需带大功率吸尘器，地毯灰尘较多。', 
        '刚装修完，全屋开荒保洁，玻璃窗户较多。注意不要弄脏墙面乳胶漆。', 
        '老客户，要求指派上次的李师傅。如果李师傅没空，请安排经验丰富的老师傅。'
    ][i % 5];
    
    const serviceItem = services[i % services.length];
    const isHighValue = serviceItem.includes('深度') || serviceItem.includes('甲醛') || serviceItem.includes('开荒');
    const marketPrice = isHighValue ? 300 + (i % 10) * 20 : 100 + (i % 5) * 10;
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + (i % 3));
    futureDate.setHours(8 + (i % 10), (i * 15) % 60);
    const expectedTime = `${(futureDate.getMonth()+1).toString().padStart(2,'0')}-${futureDate.getDate().toString().padStart(2,'0')} ${futureDate.getHours().toString().padStart(2,'0')}:${futureDate.getMinutes().toString().padStart(2,'0')}`;

    return {
      id,
      orderNo: `ORD-${String(id).padStart(6, '0')}`,
      workOrderNo: `WO-${9980 + id}`,
      expectedTime,
      mobile: `13${i % 9 + 1}****${String(1000 + i).slice(-4)}`,
      serviceItem: serviceItem,
      serviceRatio: (['3:7', '4:6', '2:8'][i % 3]) as any,
      status,
      returnReason,
      errorDetail,
      region: regions[i % regions.length],
      address: fullAddress, 
      details: baseDetails, 
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
      historyPriceLow: Math.floor(marketPrice * 0.8),
      historyPriceHigh: Math.floor(marketPrice * 1.2),
    };
  });
};

// --- 组件 ---

const BlockStat = ({ label, value, color = "text-slate-700", highlight = false, compact = false }: { label: string, value: string | number, color?: string, highlight?: boolean, compact?: boolean }) => (
  <div className={`flex flex-col items-center justify-center border border-slate-400 rounded-lg px-2 flex-1 transition-all hover:bg-blue-50/50 hover:border-slate-500 shadow-sm bg-white/40 ${compact ? 'py-0 h-[36px]' : 'py-1 h-[58px]'}`}>
    <span className={`${compact ? 'text-[9px] mb-0' : 'text-sm mb-1'} font-bold text-slate-500`}>{label}</span>
    <span className={`font-mono font-extrabold ${highlight ? 'text-emerald-600' : color} ${compact ? 'text-sm' : 'text-2xl'} leading-none tracking-tight`}>{value}</span>
  </div>
);

const NotificationBar = () => {
  return (
    <div className="flex items-center gap-4 mb-2 px-4 py-1.5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-100 rounded-lg shadow-sm overflow-hidden relative group/marquee shrink-0">
      <div className="flex items-center gap-2 text-orange-600 shrink-0 z-10 bg-inherit pr-2">
        <div className="relative">
          <Bell size={16} className="animate-[wiggle_1s_ease-in-out_infinite]" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-orange-50"></div>
        </div>
        <span className="text-xs font-bold whitespace-nowrap">系统公告</span>
      </div>
      <div className="flex-1 overflow-hidden relative h-5 flex items-center">
        <div className="whitespace-nowrap animate-[marquee_25s_linear_infinite] group-hover/marquee:[animation-play-state:paused] flex items-center gap-8 text-xs font-medium text-slate-700 cursor-default">
          <span>🔥 <span className="font-bold text-orange-600">紧急通知：</span>系统将于今晚 02:00 进行例行维护，预计耗时 15 分钟，请提前保存数据。</span>
          <span>🏆 <span className="font-bold text-blue-600">喜报：</span>恭喜上海浦东区张师傅获得本月“服务之星”称号，奖励现金 500 元！</span>
          <span>📢 <span className="font-bold text-emerald-600">新功能上线：</span>“一键快找”功能已优化，支持按地域和项目模糊搜索，欢迎体验。</span>
        </div>
      </div>
      <style>{`
        @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
      `}</style>
    </div>
  );
};

const SearchPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeType, setTimeType] = useState('create');
  const [personType, setPersonType] = useState('order');
  const [otherType, setOtherType] = useState('status');

  const stats = {
    record: { total: 128, error: 3, all: 135, afterSales: 5, refund: '450.5' },
    dispatch: { today: 42, past: 86, other: 12, self: 30, single: 8, none: 2 },
    perf: { rate: '98.5%', today: '12850.0', wechat: '5600.0', platform: '7250.0', offline: '0' }
  };

  const ActionButton = ({ icon: Icon, label, colorClass }: { icon: any, label: string, colorClass: string }) => (
    <button className={`h-6 px-2 ${colorClass} text-white text-[10px] rounded shadow-sm flex items-center gap-1 transition-all active:scale-95 font-medium whitespace-nowrap`}>
      <Icon size={10} /> {label}
    </button>
  );

  return (
    <div className={`shadow-md mb-2 transition-all duration-300 ease-in-out relative overflow-hidden border border-blue-100 rounded-lg bg-gradient-to-br from-[#f0f7ff] via-[#e6f4ff] to-[#dbeafe] shrink-0`}>
        <div className="flex w-full transition-all duration-300" style={{ height: isExpanded ? '290px' : '60px' }}>
          
          <div className={`transition-all duration-300 ease-in-out border-r border-blue-200/60 flex flex-col relative backdrop-blur-sm bg-white/30 ${isExpanded ? 'w-[66%] p-5' : 'w-[90%] px-4 flex-row items-center gap-6'}`}>
             {!isExpanded ? (
                 <div className="flex items-center w-full h-full">
                    <div className="flex items-center gap-2 shrink-0 mr-8">
                        <Activity size={20} className="text-blue-600" />
                        <span className="text-base font-bold text-slate-800">数据概览</span>
                    </div>
                    <div className="flex items-center flex-1 justify-between gap-4 overflow-hidden h-full">
                        <div className="flex items-baseline gap-1.5"><span className="text-xs font-bold text-slate-500">录单:</span><span className="text-lg font-extrabold text-slate-800">{stats.record.total}</span></div>
                        <div className="flex items-baseline gap-1.5"><span className="text-xs font-bold text-slate-500">今日派单:</span><span className="text-lg font-extrabold text-slate-800">{stats.dispatch.today}</span></div>
                        <div className="flex items-baseline gap-1.5"><span className="text-xs font-bold text-slate-500">今日业绩:</span><span className="text-lg font-extrabold text-emerald-600">{stats.perf.today}</span></div>
                        <div className="flex items-baseline gap-1.5"><span className="text-xs font-bold text-slate-500">收款率:</span><span className="text-lg font-extrabold text-slate-800">{stats.perf.rate}</span></div>
                        <div className="flex items-baseline gap-1.5"><span className="text-xs font-bold text-slate-500">退款:</span><span className="text-lg font-extrabold text-red-500">{stats.record.refund}</span></div>
                    </div>
                 </div>
             ) : (
                 <>
                    <div className="flex items-center gap-2 mb-4 h-6"> 
                        <Activity size={18} className="text-blue-600" />
                        <h3 className="text-base font-bold text-slate-800">数据概览</h3>
                    </div>
                    <div className="space-y-4 flex-1 flex flex-col justify-center"> 
                        <div className="flex items-center gap-4 h-[58px]"> 
                            <div className="flex items-center gap-2 text-blue-600 w-[80px] justify-end shrink-0"><ClipboardList size={16} /><span className="text-sm font-bold">订单情况</span></div>
                            <div className="flex items-center gap-2 flex-1 w-full">
                                <BlockStat label="录单数" value={stats.record.total} />
                                <BlockStat label="报错数" value={stats.record.error} color="text-red-500" />
                                <BlockStat label="总单数" value={stats.record.all} />
                                <BlockStat label="待售后" value={stats.record.afterSales} color="text-orange-500" />
                                <BlockStat label="退款额" value={stats.record.refund} />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 h-[58px]">
                            <div className="flex items-center gap-2 text-cyan-600 w-[80px] justify-end shrink-0"><Zap size={16} /><span className="text-sm font-bold">派单详情</span></div>
                            <div className="flex items-center gap-2 flex-1 w-full">
                                <BlockStat label="今日派单" value={stats.dispatch.today} />
                                <BlockStat label="往日派单" value={stats.dispatch.past} />
                                <BlockStat label="他派" value={stats.dispatch.other} />
                                <BlockStat label="自派" value={stats.dispatch.self} />
                                <BlockStat label="单库" value={stats.dispatch.single} />
                                <BlockStat label="未派" value={stats.dispatch.none} color="text-slate-400" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 h-[58px]">
                            <div className="flex items-center gap-2 text-indigo-600 w-[80px] justify-end shrink-0"><Wallet size={16} /><span className="text-sm font-bold">业绩指标</span></div>
                            <div className="flex items-center gap-2 flex-1 w-full">
                                <BlockStat label="收款率" value={stats.perf.rate} />
                                <BlockStat label="今日业绩" value={stats.perf.today} highlight />
                                <BlockStat label="今日微信" value={stats.perf.wechat} />
                                <BlockStat label="平台" value={stats.perf.platform} />
                                <BlockStat label="线下" value={stats.perf.offline} />
                            </div>
                        </div>
                    </div>
                 </>
             )}
          </div>

          <div 
            className={`transition-all duration-300 ease-in-out relative backdrop-blur-sm ${isExpanded ? 'w-[34%] p-4 bg-white/60' : 'w-[10%] bg-blue-100/50 hover:bg-blue-200/50 cursor-pointer flex items-center justify-center'}`}
            onClick={() => !isExpanded && setIsExpanded(true)}
          >
             {!isExpanded ? (
                 <div className="flex flex-row items-center justify-center gap-2 text-blue-600 animate-pulse w-full h-full">
                     <Search size={18} />
                     <span className="text-xs font-bold tracking-widest whitespace-nowrap">点这高级筛选</span>
                 </div>
             ) : (
                 <div className="h-full flex flex-col">
                     <div className="flex flex-col gap-3 mb-4">
                        <div className="flex justify-between items-center h-8">
                            <div className="flex items-center gap-2"><Search size={16} className="text-blue-600" /><h3 className="text-sm font-bold text-slate-800">高级筛选</h3></div>
                            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-all"><ChevronUp size={12} /> 收起</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <ActionButton icon={Plus} label="录单" colorClass="bg-blue-600 hover:bg-blue-700" />
                            <ActionButton icon={Zap} label="快找" colorClass="bg-[#6366f1] hover:bg-[#4f46e5]" />
                            <ActionButton icon={CheckSquare} label="批量完成" colorClass="bg-emerald-600 hover:bg-emerald-700" />
                            <ActionButton icon={XSquare} label="批量作废" colorClass="bg-slate-500 hover:bg-slate-600" />
                            <ActionButton icon={HelpCircle} label="存疑号码" colorClass="bg-orange-500 hover:bg-orange-600" />
                            <ActionButton icon={ShieldBan} label="黑名单" colorClass="bg-red-600 hover:bg-red-700" />
                        </div>
                     </div>
                     <div className="space-y-3 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 bg-white border border-blue-100 p-1 rounded hover:border-blue-300 transition-colors shadow-sm h-[36px]">
                            <div className="text-blue-400 px-1"><Calendar size={14} /></div>
                            <div className="relative">
                                <select value={timeType} onChange={(e) => setTimeType(e.target.value)} className="h-7 pl-1 pr-4 border-none bg-transparent text-[11px] font-bold text-slate-700 focus:ring-0 appearance-none cursor-pointer outline-none w-[70px]">
                                    <option value="create">创建时间</option><option value="finish">完成时间</option><option value="payment">收款时间</option><option value="service">服务时间</option>
                                </select>
                                <ChevronDown size={10} className="absolute right-0 top-2 text-slate-400 pointer-events-none"/>
                            </div>
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                                <input type="datetime-local" className="bg-transparent text-[10px] text-slate-600 outline-none flex-1 px-0 min-w-0 h-full" /><span className="text-slate-300">-</span><input type="datetime-local" className="bg-transparent text-[10px] text-slate-600 outline-none flex-1 px-0 min-w-0 h-full" />
                            </div>
                        </div>
                        <div className="flex gap-2 h-[36px]">
                            <div className="flex-[1.2] flex items-center gap-1 bg-white border border-blue-100 p-1 rounded hover:border-blue-300 transition-colors shadow-sm min-w-0">
                                <div className="text-blue-400 px-1 shrink-0"><User size={14} /></div>
                                <select value={personType} onChange={(e) => setPersonType(e.target.value)} className="h-7 pl-1 pr-3 border-none bg-transparent text-[11px] font-bold text-slate-700 focus:ring-0 appearance-none cursor-pointer outline-none w-[45px]">
                                    <option value="order">综合</option><option value="master">师傅</option>
                                </select>
                                <input type="text" className="bg-transparent text-[11px] text-slate-600 outline-none w-full h-full px-1 placeholder-slate-400 border-l border-slate-100" placeholder="关键字" />
                            </div>
                            <div className="flex-1 flex items-center gap-1 bg-white border border-blue-100 p-1 rounded hover:border-blue-300 transition-colors shadow-sm min-w-0">
                                <select value={otherType} onChange={(e) => setOtherType(e.target.value)} className="h-7 pl-1 pr-3 border-none bg-transparent text-[11px] font-bold text-slate-700 focus:ring-0 appearance-none cursor-pointer outline-none w-[50px]">
                                    <option value="status">状态</option><option value="service">项目</option>
                                </select>
                                <div className="flex-1 h-full min-w-0">
                                    {otherType === 'status' ? (
                                        <select className="h-full w-full px-1 border-l border-slate-100 text-[11px] text-slate-600 focus:outline-none bg-transparent appearance-none cursor-pointer">
                                            <option value="">全部</option><option value="PendingDispatch">待派单</option><option value="Completed">已完成</option>
                                        </select>
                                    ) : (
                                        <input type="text" className="bg-transparent text-[11px] text-slate-600 outline-none w-full h-full px-1 placeholder-slate-400 border-l border-slate-100" placeholder="输入" />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 h-[36px]">
                            <button className="h-full flex-1 bg-white text-slate-600 hover:text-blue-600 text-[11px] rounded transition-colors border border-slate-200 hover:border-blue-300 shadow-sm font-medium">重置</button>
                            <button onClick={(e) => { e.stopPropagation(); /* Logic */ }} className="h-full flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] rounded transition-all font-bold shadow-md flex items-center gap-2 active:scale-95 justify-center"><Search size={12} /> 立即搜索</button>
                        </div>
                     </div>
                 </div>
             )}
          </div>
        </div>
    </div>
  );
};

const ServiceItemCell = ({ item }: { item: string }) => (
  <span className="font-bold text-gray-700 hover:text-blue-600 cursor-default transition-colors truncate block" title={item}>{item}</span>
);

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
    <div className="flex flex-col items-center justify-center h-full max-w-full overflow-hidden">
      <span className={`px-1 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap ${getStatusStyle(order.status)}`}>
        {order.status}
      </span>
      {order.status === OrderStatus.Returned && order.returnReason && <span className="text-[9px] text-red-500 mt-0.5 truncate max-w-full block" title={order.returnReason}>{order.returnReason}</span>}
      {order.status === OrderStatus.Error && order.errorDetail && <span className="text-[9px] text-yellow-700 bg-yellow-50 px-1 rounded border border-yellow-200 mt-0.5 truncate max-w-full block" title={order.errorDetail}>{order.errorDetail}</span>}
    </div>
  );
};

const DispatchCell = ({ order, isFirstRow, onDispatch }: { order: Order, isFirstRow: boolean, onDispatch: (id: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFlashVisible, setIsFlashVisible] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const menuElement = document.getElementById(`dispatch-popover-${order.id}`);
        if (menuElement && !menuElement.contains(event.target as Node)) setIsOpen(false);
      }
    };
    const handleScroll = () => isOpen && setIsOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true); 
    return () => { document.removeEventListener('mousedown', handleClickOutside); window.removeEventListener('scroll', handleScroll, true); };
  }, [isOpen, order.id]);

  const togglePopover = () => {
    setIsFlashVisible(false);
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 5, left: rect.left - 40 });
    }
    setIsOpen(!isOpen);
  };

  const handleCopyAndClose = async () => {
    try {
        await navigator.clipboard.writeText(`订单号：${order.orderNo}\n...`); 
        onDispatch(order.id);
    } catch (err) { console.error("Copy failed"); }
    setIsOpen(false);
  };

  if (order.status === OrderStatus.PendingDispatch) {
    const isUrgent = order.dispatchStatus === DispatchStatus.Urgent;
    const isTimeout = order.dispatchStatus === DispatchStatus.Timeout;
    const showFlash = isFlashVisible && (isUrgent || isTimeout);

    return (
      <div className="relative inline-block w-full">
        {showFlash && (
            <div className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap z-10 animate-bounce ${isFirstRow ? '-top-5' : '-top-4'}`}>
                <span className={`text-[9px] font-bold px-1 rounded bg-white/95 border shadow-sm ${isUrgent ? 'text-orange-500 border-orange-200' : 'text-red-600 border-red-200'}`}>{order.dispatchStatus}</span>
            </div>
        )}
        <button ref={buttonRef} onClick={togglePopover} className="w-full px-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[10px] rounded shadow-sm font-medium transition-colors">派单</button>
        {isOpen && createPortal(
          <div id={`dispatch-popover-${order.id}`} className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-slate-200 p-1 w-28 animate-in fade-in zoom-in-95 duration-150" style={{ top: menuPosition.top, left: menuPosition.left }}>
            <div className="flex flex-col gap-0.5">
                <button onClick={handleCopyAndClose} className="text-[10px] py-1.5 px-2 text-left rounded hover:bg-slate-50 text-slate-700 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 线下派单</button>
                <button onClick={handleCopyAndClose} className="text-[10px] py-1.5 px-2 text-left rounded hover:bg-slate-50 text-slate-700 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 线上派单</button>
            </div>
          </div>, document.body
        )}
      </div>
    );
  }
  return <span className="text-[10px] text-gray-400 font-medium select-none">已派单</span>;
};

const OrderNoCell = ({ orderNo, hasAdvancePayment, depositAmount }: { orderNo: string; hasAdvancePayment: boolean; depositAmount?: number }) => (
  <div className="flex flex-col items-start gap-0.5 max-w-full overflow-hidden">
    <span className="text-gray-900 font-medium select-all font-mono tracking-tight truncate w-full" title={orderNo}>{orderNo}</span>
    <div className="flex gap-1 flex-wrap">
      {hasAdvancePayment && <span className="bg-rose-500 text-white text-[9px] px-1 rounded whitespace-nowrap leading-tight">已垫款</span>}
      {depositAmount && depositAmount > 0 && <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[9px] px-1 rounded whitespace-nowrap leading-tight">定金{depositAmount}</span>}
    </div>
  </div>
);

const ContactCell = ({ order, onOpenChat }: { order: Order, onOpenChat: (role: string) => void }) => {
    const roles = ['客服', '运营', '售后'];
    const createGroup = () => alert(`已为订单 ${order.orderNo} 创建群聊（客服/运营/售后/派单员）`);
    return (
        <div className="grid grid-cols-2 gap-1 w-full">
            {roles.map(r => <button key={r} onClick={()=>onOpenChat(r)} className="text-[11px] bg-white border border-slate-200 rounded px-1 py-0.5 hover:text-blue-600 hover:border-blue-300 transition-colors text-center">{r}</button>)}
            <button onClick={createGroup} className="text-[11px] bg-white border border-slate-200 rounded px-1 py-0.5 hover:text-blue-600 hover:border-blue-300 transition-colors text-center flex items-center justify-center gap-0.5 text-slate-700"><Users size={10}/> 群聊</button>
        </div>
    )
};

const ActionCell = ({ orderId, onAction }: { orderId: number; onAction: (action: string, id: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const menuElement = document.getElementById(`action-menu-${orderId}`);
        if (menuElement && !menuElement.contains(event.target as Node)) setIsOpen(false);
      }
    };
    const handleScroll = () => isOpen && setIsOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true); 
    return () => { document.removeEventListener('mousedown', handleClickOutside); window.removeEventListener('scroll', handleScroll, true); };
  }, [isOpen, orderId]);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 5, left: rect.right - 120 });
    }
    setIsOpen(!isOpen);
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
    { name: '中转', icon: ArrowRightLeft, color: 'text-indigo-600' },
    { name: '修改', icon: Edit, color: 'text-blue-500' },
    { name: '取消', icon: Ban, color: 'text-red-500' },
  ];

  return (
    <>
      <button ref={buttonRef} onClick={toggleMenu} className={`px-1 py-1.5 rounded text-[10px] font-medium transition-all flex items-center justify-center gap-0.5 border w-full ${isOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:text-blue-600'}`}>
        操作 <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && createPortal(
        <div id={`action-menu-${orderId}`} className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 w-28" style={{ top: menuPosition.top, left: menuPosition.left }}>
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button key={index} onClick={() => { setIsOpen(false); onAction(item.name, orderId); }} className="w-full text-left px-3 py-1.5 text-[10px] flex items-center hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                <item.icon size={12} className={`mr-2 transition-transform group-hover:scale-110 ${item.color}`} />
                <span className="text-gray-700 font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </div>, document.body
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
  const [orders, setOrders] = useState<Order[]>(generateMockData());
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [chatState, setChatState] = useState<{isOpen: boolean; role: string; order: Order | null;}>({ isOpen: false, role: '', order: null });
  
  const handleDispatch = (id: number) => {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: OrderStatus.Completed, dispatchStatus: DispatchStatus.Normal } : o));
  };

  const handleAction = (action: string, id: number) => {
    const order = sortedData.find(o => o.id === id);
    if (!order) return;
    if (action === '完单') { setCurrentOrder(order); setCompleteModalOpen(true); } 
    else { alert(`已执行操作：${action} (订单ID: ${id})`); }
  };

  const handleOpenChat = (role: string, order: Order) => { setChatState({ isOpen: true, role, order }); };

  const sortedData = [...orders].sort((a, b) => {
    const getUrgency = (s: DispatchStatus, os: OrderStatus) => os !== OrderStatus.PendingDispatch ? 0 : (s === DispatchStatus.Urgent ? 3 : (s === DispatchStatus.Timeout ? 2 : 1));
    return getUrgency(b.dispatchStatus, b.status) - getUrgency(a.dispatchStatus, a.status);
  });

  return (
    <div className="h-screen bg-slate-200 p-2 flex flex-col overflow-hidden font-sans">
      <NotificationBar />
      <SearchPanel />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-300 flex-1 flex flex-col overflow-hidden mt-2">
        <div className="overflow-auto flex-1 w-full">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 z-20 shadow-sm bg-slate-50">
              <tr className="border-b border-gray-300 text-[13px] font-bold text-slate-700 tracking-tight">
                <th style={{width: '5.5%'}} className="px-1 py-2 text-center">手机号</th>
                <th style={{width: '4.5%'}} className="px-1 py-2">服务项目</th>
                <th style={{width: '3.5%'}} className="px-1 py-2 text-center">状态</th>
                <th style={{width: '3%'}} className="px-1 py-2 text-center">系数</th> 
                <th style={{width: '6%'}} className="px-1 py-2">地域</th>
                <th style={{width: '6%'}} className="px-1 py-2">详细地址</th> 
                <th style={{width: '20.5%'}} className="px-1 py-2">详情</th>
                <th style={{width: '4%'}} className="px-1 py-2 text-center">分成</th>
                <th style={{width: '4%'}} className="px-1 py-2 text-center">方式</th>
                <th style={{width: '3.5%'}} className="px-1 py-2 text-center">划线价</th>
                <th style={{width: '3.5%'}} className="px-1 py-2 text-center">历史价</th>
                <th style={{width: '4%'}} className="px-1 py-2 text-center">来源</th>
                <th style={{width: '5%'}} className="px-1 py-2">订单/工单号</th>
                <th style={{width: '6%'}} className="px-1 py-2">录单/上门时间</th> 
                <th style={{width: '4%'}} className="px-1 py-2 text-center">资源</th>
                <th style={{width: '8%'}} className="px-1 py-2 text-center">联系人</th>
                <th style={{width: '3.4%'}} className="px-1 py-2 text-center">派单</th> 
                <th style={{width: '4%'}} className="px-1 py-2 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedData.slice(0, 20).map((order, index) => { 
                const isFirstRow = index === 0;
                return (
                  <tr key={order.id} className={`bg-white even:bg-gray-100 hover:!bg-blue-100 transition-colors text-[10px] border-b border-gray-200 last:border-0 align-middle ${isFirstRow ? 'h-16' : 'h-12'}`}>
                      <td className={`px-1 py-1 font-bold text-slate-800 text-center ${isFirstRow?'pt-5':''}`}>{order.mobile}</td>
                      <td className={`px-1 py-1 truncate ${isFirstRow?'pt-5':''}`} title={order.serviceItem}><ServiceItemCell item={order.serviceItem}/></td>
                      <td className={`px-1 py-1 text-center ${isFirstRow?'pt-5':''}`}><StatusCell order={order} /></td>
                      <td className={`px-1 py-1 text-center font-mono text-black font-medium ${isFirstRow?'pt-5':''}`}>{order.weightedCoefficient.toFixed(1)}</td>
                      <td className={`px-1 py-1 truncate ${isFirstRow?'pt-5':''}`}>
                          <div className="truncate" title={order.region}>{order.region}</div>
                          <div className="text-[9px] text-blue-500">{order.regionPeople}人</div>
                      </td>
                      <td className={`px-1 py-1 text-gray-700 ${isFirstRow?'pt-5':''}`}>
                          <div className="line-clamp-2 leading-tight" title={order.address}>{order.address}</div>
                      </td>
                      
                      <td className={`px-1 py-1 ${isFirstRow?'pt-5':''}`}>
                          <div className="line-clamp-2 text-slate-600 leading-tight" title={order.details}>{order.details}</div>
                      </td>
                      
                      <td className={`px-1 py-1 text-center font-bold text-yellow-600 ${isFirstRow?'pt-5':''}`}>{order.serviceRatio}</td>
                      <td className={`px-1 py-1 text-center ${isFirstRow?'pt-5':''}`}>
                          <span className={`px-1 rounded ${order.dispatchMethod === DispatchMethod.Grab ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'}`}>{order.dispatchMethod}</span>
                      </td>
                      <td className={`px-1 py-1 text-center font-bold text-slate-800 ${isFirstRow?'pt-5':''}`}>{order.marketPrice}</td>
                      <td className={`px-1 py-1 text-center text-black ${isFirstRow?'pt-5':''}`}>{order.historyPriceLow}-{order.historyPriceHigh}</td>
                      
                      <td className={`px-1 py-1 text-center ${isFirstRow?'pt-5':''}`}><span className="px-1 bg-gray-100 rounded text-slate-500">{order.source}</span></td>
                      
                      <td className={`px-1 py-1 ${isFirstRow?'pt-5':''}`}>
                          <OrderNoCell orderNo={order.orderNo} hasAdvancePayment={order.hasAdvancePayment} depositAmount={order.depositAmount} />
                          <div className="text-[9px] text-slate-400 font-mono truncate" title={order.workOrderNo}>{order.workOrderNo}</div>
                      </td>
                      
                      {/* 优化：增大 gap，增大字号和圆圈大小 */}
                      <td className={`px-1 py-1 ${isFirstRow?'pt-5':''}`}>
                          <div className="flex flex-col gap-1">
                              <div className="text-[9px] text-slate-400 flex items-center gap-1">
                                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] scale-90">录</span>
                                  {order.recordTime}
                              </div>
                              <div className="text-[9px] text-blue-600 font-medium flex items-center gap-1">
                                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] scale-90">期</span>
                                  {order.expectedTime}
                              </div>
                          </div>
                      </td>

                      <td className={`px-1 py-1 text-center ${isFirstRow?'pt-5':''}`}>
                          <button onClick={() => alert("查资源: " + order.region)} className="bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 px-1 py-0.5 rounded transition-colors text-[12px]">查资源</button>
                      </td>

                      <td className={`px-1 py-1 ${isFirstRow?'pt-5':''}`}><ContactCell order={order} onOpenChat={(r) => alert("Chat " + r)} /></td>
                      
                      <td className={`px-1 py-1 text-center ${isFirstRow?'pt-5':''}`}><DispatchCell order={order} isFirstRow={isFirstRow} onDispatch={handleDispatch} /></td>
                      <td className={`px-1 py-1 text-center ${isFirstRow?'pt-5':''}`}><ActionCell orderId={order.id} onAction={(act)=>alert(act)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-slate-500 shrink-0">
           <span>共 128 条</span>
           <div className="flex gap-1"><button className="px-2 py-0.5 bg-white border rounded">上一页</button><button className="px-2 py-0.5 bg-white border rounded">下一页</button></div>
        </div>
      </div>
      <CompleteOrderModal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} order={currentOrder} />
      <ChatModal isOpen={chatState.isOpen} onClose={() => setChatState(prev => ({ ...prev, isOpen: false }))} role={chatState.role} order={chatState.order} />
    </div>
  );
};

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }
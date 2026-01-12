import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Eye,
  FileText,
  Settings,
  ChevronRight,
  ChevronDown,
  UserCheck,
  MessageSquare,
  BarChart3,
  Cog,
  Building2,
  Clock,
  BookMarked,
  DoorOpen,
  UserPlus,
  UserCog,
  Shield,
  Menu,
  X,
  CalendarCheck,
  Target,
  PieChart,
  Folder,
  CheckSquare,
  Send,
  Key,
  CreditCard,
  HelpCircle,
  Award,
  ClipboardList,
  UserX,
  ClockAlert,
  LogOut,
  GraduationCap,
  Users2,
  ClipboardCheck,
  TrendingUp,
  FolderKanban,
  FileSpreadsheet,
  Sparkles,
  UsersRound,
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

const Sidebar = ({ onClose, isCollapsed, toggleCollapse }: SidebarProps) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  // Local state for collapse if not provided by parent (fallback)
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const collapsed = isCollapsed !== undefined ? isCollapsed : localCollapsed;
  const handleToggle =
    toggleCollapse || (() => setLocalCollapsed(!localCollapsed));

  const menuItems = [
    {
      key: "dashboard",
      label: "الرئيسية",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      key: "initial-settings",
      label: "الإعدادات العامة",
      icon: Cog,
      path: "/dashboard/initial-settings",
      subItems: [
        {
          label: "بيانات المدرسة",
          path: "/dashboard/initial-settings/school-info",
        },
        { label: "إدارة التوقيت", path: "/dashboard/initial-settings/timing" },
        { label: "إدارة المواد", path: "/dashboard/initial-settings/subjects" },
        {
          label: "إدارة الفصول",
          path: "/dashboard/initial-settings/classrooms",
        },
        { label: "إدارة الطلاب", path: "/dashboard/initial-settings/students" },
        {
          label: "إدارة المعلمين",
          path: "/dashboard/initial-settings/teachers",
        },
        {
          label: "إدارة الإداريين",
          path: "/dashboard/initial-settings/administrators",
        },
      ],
    },
    {
      key: "school-schedule",
      label: "الجدول المدرسي",
      icon: Calendar,
      path: "/dashboard/schedule",
      subItems: [
        { label: "إسناد المواد", path: "/dashboard/assignment" },
        { label: "إعدادات الجدول", path: "/dashboard/schedule/settings" },
        { label: "إنشاء الجدول", path: "/dashboard/schedule/tables" },
      ],
    },
    {
      key: "supervision",
      label: "الإشراف والمناوبة",
      icon: Eye,
      path: "/dashboard/supervision/forms",
      subItems: [
        { label: "الإشراف اليومي", path: "/dashboard/supervision/daily" },
        { label: "المناوبة اليومية", path: "/dashboard/supervision/duty" },
      ],
    },
    {
      key: "daily-waiting",
      label: "الانتظار اليومي",
      icon: CalendarCheck,
      path: "/dashboard/daily-waiting",
    },

    {
      key: "messages",
      label: "الرسائل",
      icon: Send,
      path: "/dashboard/messages",
    },
    {
      key: "permissions",
      label: "الصلاحيات",
      icon: Key,
      path: "/dashboard/permissions",
    },
    {
      key: "subscription",
      label: "الاشتراك والفوترة",
      icon: CreditCard,
      path: "/dashboard/subscription",
    },
    {
      key: "support",
      label: "الدعم الفني",
      icon: HelpCircle,
      path: "/dashboard/support",
    },
  ];

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus((prev) => {
      // If the clicked menu is already open, close it (return empty array or filter?)
      // To strictly enforce one open: If it's open, close it. If it's closed, open it (and close others).
      if (prev.includes(menuKey)) {
        return []; // Close all/current
      } else {
        return [menuKey]; // Open this one, implicit close others.
      }
    });
  };

  const isActiveMenu = (item: any) => {
    if (item.subItems) {
      return item.subItems.some(
        (subItem: any) => location.pathname === subItem.path
      );
    }
    return location.pathname === item.path;
  };

  return (
    <>
      <div
        className={`overlay ${onClose ? "show" : ""}`}
        onClick={onClose}
        style={{ display: onClose ? "block" : "none" }}
      ></div>
      <aside
        className={`sidebar ${onClose ? "open" : ""} ${
          collapsed ? "collapsed" : ""
        }`}
        id="sidebar"
      >
        {/* Toggle Button (Desktop) */}
        {!onClose && (
          <div className="sidebar-toggle" onClick={handleToggle}>
            <i
              className={`fa-solid ${
                collapsed ? "fa-bars" : "fa-bars-staggered"
              }`}
            ></i>
          </div>
        )}

        <div className="px-8 mb-6 flex justify-between items-center mt-4">
          <div className="sidebar-header-text transition-opacity duration-300">
            {!collapsed && (
                <div className="flex items-center gap-3 mt-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#655ac1] to-[#8779fb] rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-300">
                        <span className="text-white text-xl font-black">M</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">متابع</h1>
                </div>
            )}
            {collapsed && (
              <div
                style={{ height: "3rem" }}
              ></div> /* Spacer for collapsed header */
            )}
          </div>
          {onClose && (
            <button className="md:hidden text-white text-xl" onClick={onClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <ul className="nav-list">
          {menuItems.map((item) => {
            const active = isActiveMenu(item);
            const isExpanded = expandedMenus.includes(item.key);
            // Only show active style for parents if they are expanded (prevents double highlight when exploring)
            const showActive = item.subItems ? isExpanded : active;

            return (
              <li
                key={item.key}
                className={`nav-item ${showActive ? "active" : ""} ${
                  isExpanded ? "expanded" : ""
                }`}
              >
                {item.subItems ? (
                  <>
                    <a
                      href="#"
                      className="nav-link"
                      data-title={item.label} /* For tooltip */
                      title={collapsed ? item.label : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        if (collapsed) {
                          handleToggle(); // Auto expand if clicking parent when collapsed? Or just toggle menu?
                          // Let's toggle menu. If collapsed, menu might not show well unless we use popovers.
                          // Simplest UX: Expand sidebar if user clicks a parent item.
                          // But requirement says "Hamburger closes... in case of expansion".
                          // Let's just toggle menu.
                        }
                        toggleMenu(item.key);
                      }}
                    >
                      <i>
                        <item.icon className="w-5 h-5" />
                      </i>
                      <span className="nav-text">{item.label}</span>
                      <i className="fa-solid fa-angle-down arrow-icon"></i>
                    </a>
                    {expandedMenus.includes(item.key) && !collapsed && (
                      <ul
                        className="sub-nav-list"
                        style={{ paddingRight: "20px", listStyle: "none" }}
                      >
                        {item.subItems.map((subItem: any) => (
                          <li
                            key={subItem.path}
                            className="nav-item"
                            style={{ marginBottom: "0" }}
                          >
                            <NavLink
                              to={subItem.path}
                              className={({ isActive }) =>
                                `nav-link ${
                                  isActive ? "font-bold text-white" : ""
                                }`
                              }
                              style={{ height: "40px", fontSize: "0.8rem" }}
                            >
                              <span className="mr-2 border-r pr-2 border-white/20 nav-text">
                                {subItem.label}
                              </span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className="nav-link"
                    data-title={item.label}
                    title={collapsed ? item.label : ""}
                    onClick={() => setExpandedMenus([])}
                  >
                    <i>
                      <item.icon className="w-5 h-5" />
                    </i>
                    <span className="nav-text">{item.label}</span>
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;

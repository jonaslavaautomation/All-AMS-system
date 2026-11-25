import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  GraduationCap,
  Grid2X2,
  House,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react';

type IconType = typeof House;
type NavItem = { label: string; icon: IconType; section?: string };

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Users', icon: Users },
  { label: 'Courses', icon: BookOpen },
  { label: 'Sales', icon: CircleDollarSign },
  { label: 'Reports', icon: MessageSquareText },
  { label: 'App Hub', icon: Grid2X2 },
  { label: 'Settings', icon: Settings },
  { label: 'Courses', icon: BookOpen, section: 'Products' },
  { label: 'Coaching', icon: BriefcaseBusiness },
  { label: 'Digital Downloads', icon: Download },
  { label: 'Memberships', icon: ShieldCheck },
  { label: 'Collections', icon: Trophy },
];

const stats = [
  { label: 'Total Students', value: '892', change: '+4.12%', icon: Users, color: 'blue' },
  { label: 'Active Courses', value: '324', change: '+3%', icon: BookOpen, color: 'teal' },
  { label: 'Completion Rate', value: '78%', change: '+0.2', icon: ShieldCheck, color: 'violet' },
  { label: 'Avg Rating', value: '4.8', change: '+0.2', icon: Star, color: 'amber' },
] as const;

const activity = [
  { title: 'New Student Enrolled', detail: 'Marilie Dazio', time: '2 min ago', icon: UserRound },
  { title: 'Course Completed', detail: 'Insurance 101', time: '3 min ago', icon: Play },
  { title: 'New Course Published', detail: 'Auto Insurance Basics', time: '5 min ago', icon: House },
  { title: 'Certificate Issued', detail: 'to James Paal Sargado', time: '7 min ago', icon: Trophy },
  { title: 'New Student Enrolled', detail: 'Rowanne Macachor', time: '8 min ago', icon: UserRound },
];

const courses = [
  { title: 'Home Insurance Essentials', detail: 'Updated: Nov 18, 2025 · 5 Lessons', enrolled: '147 Enrolled', type: 'NEW', image: 'house' },
  { title: 'Auto Insurance Basics', detail: '312 Enrolled', enrolled: '+7.4%', type: '', image: 'car' },
  { title: 'ACORD Forms Training', detail: '227 Enrolled', enrolled: '', type: '', image: 'paper' },
];

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [range, setRange] = useState('30D');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [query, setQuery] = useState('');
  const [interaction, setInteraction] = useState('Choose a card or section to explore the dashboard.');
  const [growthRange, setGrowthRange] = useState('This Month');

  const handleAction = (message: string): void => {
    setInteraction(message);
  };

  const visibleActivity = useMemo(() => {
    const filtered = activity.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(query.toLowerCase()));
    return showAllActivity ? filtered : filtered.slice(0, 5);
  }, [query, showAllActivity]);

  return (
    <main className="dashboard-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><GraduationCap size={27} strokeWidth={2.2} /></div>
          <div><strong>LAVA<span> LMS</span></strong><small>University</small></div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        <nav className="nav-list">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={`${item.label}-${index}`}>
                {item.section && <p className="nav-section">{item.section}</p>}
                <button className={`nav-item ${activeNav === item.label && !item.section ? 'active' : ''}`} onClick={() => { setActiveNav(item.label); setMobileOpen(false); }}>
                  <Icon size={19} strokeWidth={1.8} /><span>{item.label}</span>
                </button>
              </div>
            );
          })}
        </nav>
        <div className="academy-card hoverable" data-hint="Open your academy workspace">
          <GraduationCap size={36} />
          <strong>LAVA University</strong>
          <span>Grow, Learn, Excel.</span>
          <button onClick={() => handleAction('Opening the LAVA University academy.')}>View Academy <ChevronRight size={13} /></button>
        </div>
        <button className="profile-row hoverable" data-hint="Open account settings" onClick={() => handleAction('Opening your administrator profile.')}>
          <div className="avatar">JR</div>
          <div><strong>Jonas Rosauro</strong><span>Super Admin</span></div>
          <ChevronDown size={15} />
        </button>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="welcome"><h1>Welcome back, Jonas Rosauro!</h1><p>Here's what's happening with your LAVA University today.</p></div>
          <div className="top-actions">
            <div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, students..." /><kbd>⌘ K</kbd></div>
            <button className="icon-button notification hoverable" data-hint="View your latest notifications" aria-label="Notifications" onClick={() => handleAction('You have 9 new notifications.') }><Bell size={18} /><i>9</i></button>
            <button className="school-button hoverable" data-hint="Open your public school page" onClick={() => handleAction('Opening your school preview.') }><GraduationCap size={17} /> <span>View Your School</span></button>
          </div>
        </header>
        <div className="interaction-note"><Sparkles size={14} /><span>{interaction}</span></div>

        <div className="stats-grid">
          {stats.map((stat) => { const Icon = stat.icon; return <button className="stat-card hoverable" data-hint={`Open ${stat.label.toLowerCase()} details`} key={stat.label} onClick={() => handleAction(`${stat.label}: ${stat.value}, trending ${stat.change} this period.`)}><div className={`stat-icon ${stat.color}`}><Icon size={26} /></div><div className="stat-copy"><strong>{stat.value}</strong><span>{stat.label}</span></div><div className="sparkline"><svg viewBox="0 0 110 50" preserveAspectRatio="none"><path d="M1 42 C 18 39, 23 16, 39 31 S 55 34, 65 14 S 78 24, 91 15 S 101 17, 109 4" fill="none" stroke="currentColor" strokeWidth="2" /></svg><small><ArrowUpRight size={13} /> {stat.change}</small></div></button>; })}
        </div>

        <div className="content-grid">
          <section className="panel overview-panel hoverable" data-hint="Compare enrollments, completions, and certificates over time" onClick={() => handleAction(`Learning overview is showing the ${range} performance range.`)}>
            <div className="panel-heading"><div><h2><TrendingUp size={20} /> Learning Overview</h2></div><div className="range-tabs">{['7D', '30D', '90D', '1Y'].map((item) => <button key={item} className={range === item ? 'selected' : ''} onClick={() => setRange(item)}>{item}</button>)}</div></div>
            <div className="chart-legend"><span><i className="legend-dot enroll" /> Enrollments</span><span><i className="legend-dot complete" /> Completions</span><span><i className="legend-dot certificate" /> Certificates</span></div>
            <div className="chart-wrap"><div className="y-labels"><span>1,000</span><span>750</span><span>500</span><span>250</span><span>0</span></div><svg className="main-chart" viewBox="0 0 720 220" preserveAspectRatio="none"><g className="chart-grid"><path d="M0 8H720 M0 60H720 M0 112H720 M0 164H720 M0 216H720" /><path d="M0 0V220 M72 0V220 M144 0V220 M216 0V220 M288 0V220 M360 0V220 M432 0V220 M504 0V220 M576 0V220 M648 0V220 M720 0V220" /></g><path className="line-one" d="M0 197 C 30 193, 47 173, 73 170 S 112 155, 145 162 S 177 149, 216 157 S 252 136, 288 142 S 320 105, 360 112 S 400 114, 432 99 S 471 105, 504 96 S 543 102, 576 87 S 610 101, 648 84 S 689 70, 720 56" /><path className="line-two" d="M0 212 C 25 208, 53 203, 73 192 S 109 187, 145 188 S 180 179, 216 185 S 254 167, 288 175 S 323 153, 360 158 S 398 164, 432 145 S 469 157, 504 143 S 541 154, 576 137 S 611 144, 648 126 S 691 122, 720 99" /><path className="line-three" d="M0 219 C 34 217, 48 211, 73 213 S 108 208, 145 210 S 180 202, 216 207 S 252 197, 288 202 S 324 192, 360 194 S 400 184, 432 187 S 470 180, 504 184 S 543 178, 576 181 S 613 177, 648 178 S 690 168, 720 164" /><circle cx="720" cy="56" r="4.5" className="dot-one" /><circle cx="720" cy="99" r="4.5" className="dot-two" /><circle cx="720" cy="164" r="4.5" className="dot-three" /><g className="tooltip"><rect x="595" y="14" width="110" height="50" rx="8" /><text x="606" y="31">Nov 18</text><circle cx="608" cy="48" r="4" /><text x="618" y="51">Enrollments: 892</text></g></svg><div className="x-labels"><span>Oct 19</span><span>Oct 22</span><span>Oct 25</span><span>Oct 28</span><span>Oct 31</span><span>Nov 03</span><span>Nov 06</span><span>Nov 09</span><span>Nov 12</span><span>Nov 15</span><span>Nov 18</span></div></div>
          </section>

          <section className="panel activity-panel"><div className="panel-heading"><h2><Zap size={20} /> Recent Activity</h2><button className="view-link" onClick={() => setShowAllActivity(!showAllActivity)}>{showAllActivity ? 'Show Less' : 'View All'} <ArrowUpRight size={14} /></button></div><div className="activity-list">{visibleActivity.map((item, index) => { const Icon = item.icon; return <button className="activity-item hoverable" data-hint="Open activity details" key={`${item.title}-${index}`} onClick={() => handleAction(`${item.title}: ${item.detail}. Recorded ${item.time}.`)}><div className="activity-icon"><Icon size={17} /></div><div className="activity-copy"><strong>{item.title}</strong><span>{item.detail}</span></div><time>{item.time}</time></button>; })}</div></section>

          <section className="panel courses-panel"><div className="panel-heading"><h2><BookOpen size={19} /> Latest Courses</h2><button className="view-link" onClick={() => handleAction('Showing the full course library.')}><span>View All</span> <ArrowUpRight size={14} /></button></div><div className="course-list">{courses.map((course) => <button className="course-item hoverable" data-hint="Open course details" key={course.title} onClick={() => handleAction(`${course.title} selected. ${course.detail}.`)}><div className={`course-thumb ${course.image}`}><BookOpen size={22} /></div><div className="course-copy">{course.type && <em>{course.type}</em>}<strong>{course.title}</strong><span>{course.detail}</span></div>{course.enrolled && <small>{course.enrolled}</small>}<span className="more-button" aria-hidden="true"><MoreHorizontal size={18} /></span></button>)}</div></section>

          <section className="panel growth-panel hoverable" data-hint="Review new student growth" onClick={() => handleAction(`Student growth is currently filtered to ${growthRange.toLowerCase()}.`)}><div className="panel-heading"><h2><Activity size={19} /> Student Growth</h2><button className="select-button" onClick={(event) => { event.stopPropagation(); setGrowthRange(growthRange === 'This Month' ? 'This Quarter' : 'This Month'); handleAction(`Growth range changed to ${growthRange === 'This Month' ? 'this quarter' : 'this month'}.`); }}>{growthRange} <ChevronDown size={14} /></button></div><div className="growth-content"><div className="growth-number"><strong>+12% <ArrowUpRight size={25} /></strong><span>New Students</span></div><div className="bar-chart">{[27, 35, 43, 42, 58, 54, 67, 62, 76, 68, 81, 94].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="growth-side"><div><Users size={20} /><strong>892</strong><span>Total Students</span></div><div><GraduationCap size={20} /><strong>324</strong><span>Active Learners</span></div></div></div><div className="growth-labels"><span>Nov 12</span><span>Nov 14</span><span>Nov 16</span><span>Nov 18</span></div></section>
        </div>

        <div className="bottom-row"><button className="quick-stat hoverable" data-hint="See access coverage" onClick={() => handleAction('Course access is at 96% across your school.')}><div className="quick-icon"><ShieldCheck size={18} /></div><strong>96%</strong><span>Course Access</span></button><button className="quick-stat hoverable" data-hint="See session duration" onClick={() => handleAction('Average session time is 2.5 hours.')}><div className="quick-icon"><Clock3 size={18} /></div><strong>2.5 hrs</strong><span>Avg. Session Time</span></button><button className="quick-stat hoverable" data-hint="See system status" onClick={() => handleAction('Platform uptime is 98.4%.')}><div className="quick-icon"><LifeBuoy size={18} /></div><strong>98.4%</strong><span>Platform Uptime</span></button><button className="quick-stat hoverable" data-hint="See satisfaction results" onClick={() => handleAction('User satisfaction is rated 4.9 out of 5.')}><div className="quick-icon"><Sparkles size={18} /></div><strong>4.9/5</strong><span>User Satisfaction</span></button></div>
      </section>
    </main>
  );
}

export default App;

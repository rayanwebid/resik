<!DOCTYPE html>
<html lang="id" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') — SI-SAMPAH Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
            --primary: #16a34a;
            --primary-dark: #15803d;
            --primary-light: #dcfce7;
            --accent: #22c55e;
            --sidebar-bg: #0f172a;
            --sidebar-text: #94a3b8;
            --sidebar-hover: #1e293b;
            --sidebar-active: #16a34a;
            --bg: #f0fdf4;
            --surface: #ffffff;
            --border: #e2e8f0;
            --text: #1e293b;
            --text-muted: #64748b;
            --danger: #ef4444;
            --warning: #f59e0b;
            --info: #3b82f6;
            --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
            --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
            --radius: 12px;
            --sidebar-w: 260px;
        }
        html, body { height: 100%; font-family: 'Inter', sans-serif; color: var(--text); background: var(--bg); }

        /* ── Sidebar ── */
        .sidebar {
            position: fixed; top: 0; left: 0; height: 100%; width: var(--sidebar-w);
            background: var(--sidebar-bg); display: flex; flex-direction: column; z-index: 100;
            transition: transform .3s ease;
        }
        .sidebar-brand {
            padding: 24px 20px; display: flex; align-items: center; gap: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-brand .logo {
            width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary), var(--accent));
            border-radius: 10px; display: flex; align-items: center; justify-content: center;
            font-size: 18px; color: white; font-weight: 800; flex-shrink: 0;
        }
        .sidebar-brand .name { color: #fff; font-weight: 700; font-size: 15px; line-height: 1.2; }
        .sidebar-brand .sub  { color: var(--sidebar-text); font-size: 11px; margin-top: 2px; }

        .sidebar-nav { flex: 1; overflow-y: auto; padding: 12px 0; }
        .nav-section { padding: 8px 20px 4px; font-size: 10px; font-weight: 600;
            color: rgba(148,163,184,0.5); text-transform: uppercase; letter-spacing: .1em; }
        .nav-item {
            display: flex; align-items: center; gap: 10px; padding: 10px 20px;
            color: var(--sidebar-text); text-decoration: none; font-size: 14px; font-weight: 500;
            transition: all .2s; position: relative; border-radius: 0; margin: 1px 0;
        }
        .nav-item:hover { background: var(--sidebar-hover); color: #fff; }
        .nav-item.active {
            background: linear-gradient(90deg, rgba(22,163,74,0.15), rgba(22,163,74,0.05));
            color: #fff;
        }
        .nav-item.active::before {
            content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
            height: 60%; width: 3px; background: var(--accent); border-radius: 0 3px 3px 0;
        }
        .nav-item .icon { width: 20px; text-align: center; font-size: 15px; }
        .nav-item .badge {
            margin-left: auto; background: var(--danger); color: #fff; font-size: 10px;
            font-weight: 700; padding: 2px 6px; border-radius: 99px;
        }

        .sidebar-footer {
            padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-user { display: flex; align-items: center; gap: 10px; }
        .sidebar-user .avatar {
            width: 36px; height: 36px; background: linear-gradient(135deg, var(--primary), var(--accent));
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: white; font-weight: 700; font-size: 14px; flex-shrink: 0;
        }
        .sidebar-user .info .name  { color: #fff; font-size: 13px; font-weight: 600; }
        .sidebar-user .info .role  { color: var(--sidebar-text); font-size: 11px; }
        .sidebar-user .logout-btn  {
            margin-left: auto; color: var(--sidebar-text); background: none; border: none;
            cursor: pointer; font-size: 16px; padding: 4px; transition: color .2s;
        }
        .sidebar-user .logout-btn:hover { color: var(--danger); }

        /* ── Main Layout ── */
        .main { margin-left: var(--sidebar-w); min-height: 100vh; display: flex; flex-direction: column; }

        /* ── Topbar ── */
        .topbar {
            position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.9);
            backdrop-filter: blur(12px); border-bottom: 1px solid var(--border);
            padding: 0 28px; height: 64px; display: flex; align-items: center; gap: 16px;
        }
        .topbar .page-title { font-size: 18px; font-weight: 700; flex: 1; }
        .topbar .meta { font-size: 13px; color: var(--text-muted); }
        .topbar .btn-mobile-menu { display: none; }

        /* ── Content ── */
        .content { flex: 1; padding: 28px; }

        /* ── Alerts ── */
        .alert {
            padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;
            font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px;
        }
        .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .alert-error   { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        /* ── Cards ── */
        .card {
            background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border);
            box-shadow: var(--shadow); overflow: hidden;
        }
        .card-header {
            padding: 18px 20px; border-bottom: 1px solid var(--border);
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .card-title { font-size: 15px; font-weight: 700; }
        .card-body  { padding: 20px; }

        /* ── Stat Cards ── */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat-card {
            background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border);
            padding: 20px; display: flex; align-items: flex-start; gap: 14px; box-shadow: var(--shadow);
            transition: transform .2s, box-shadow .2s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .stat-icon {
            width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center;
            justify-content: center; font-size: 20px; flex-shrink: 0;
        }
        .stat-icon.green  { background: #dcfce7; color: var(--primary); }
        .stat-icon.blue   { background: #dbeafe; color: var(--info); }
        .stat-icon.orange { background: #ffedd5; color: #ea580c; }
        .stat-icon.red    { background: #fee2e2; color: var(--danger); }
        .stat-icon.purple { background: #f3e8ff; color: #9333ea; }
        .stat-icon.teal   { background: #ccfbf1; color: #0d9488; }
        .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 500; margin-bottom: 4px; }
        .stat-value { font-size: 24px; font-weight: 800; line-height: 1; }
        .stat-sub   { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

        /* ── Tables ── */
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead th {
            padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600;
            text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted);
            background: #f8fafc; border-bottom: 1px solid var(--border);
        }
        tbody td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover { background: #f8fafc; }

        /* ── Badges ── */
        .badge {
            display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px;
            border-radius: 99px; font-size: 11px; font-weight: 600;
        }
        .badge-green  { background: #dcfce7; color: #166534; }
        .badge-red    { background: #fee2e2; color: #991b1b; }
        .badge-yellow { background: #fef9c3; color: #854d0e; }
        .badge-blue   { background: #dbeafe; color: #1e40af; }
        .badge-gray   { background: #f1f5f9; color: #475569; }
        .badge-orange { background: #ffedd5; color: #9a3412; }
        .badge-purple { background: #f3e8ff; color: #6b21a8; }

        /* ── Buttons ── */
        .btn {
            display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
            border-radius: 8px; font-size: 13px; font-weight: 600; border: none; cursor: pointer;
            text-decoration: none; transition: all .15s;
        }
        .btn:hover { opacity: .9; transform: translateY(-1px); }
        .btn-primary  { background: var(--primary); color: white; }
        .btn-success  { background: #22c55e; color: white; }
        .btn-danger   { background: var(--danger); color: white; }
        .btn-warning  { background: var(--warning); color: white; }
        .btn-info     { background: var(--info); color: white; }
        .btn-sm       { padding: 5px 10px; font-size: 12px; }
        .btn-ghost    { background: #f1f5f9; color: var(--text); }
        .btn-ghost:hover { background: #e2e8f0; }
        .btn-outline  { background: transparent; border: 1.5px solid var(--border); color: var(--text); }

        /* ── Forms ── */
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text); }
        .form-control {
            width: 100%; padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 8px;
            font-size: 14px; color: var(--text); background: #fff; outline: none; transition: border-color .2s;
            font-family: inherit;
        }
        .form-control:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(22,163,74,0.12); }
        .form-error { font-size: 12px; color: var(--danger); margin-top: 4px; }
        .form-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

        /* ── Pagination ── */
        .pagination { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 16px; }
        .pagination a, .pagination span {
            display: inline-flex; align-items: center; justify-content: center;
            width: 34px; height: 34px; border-radius: 8px; font-size: 13px; font-weight: 500;
            text-decoration: none; color: var(--text); border: 1px solid var(--border); background: #fff;
        }
        .pagination a:hover { background: var(--primary); color: #fff; border-color: var(--primary); }
        .pagination span.active { background: var(--primary); color: #fff; border-color: var(--primary); }
        .pagination span.disabled { opacity: .4; cursor: not-allowed; }

        /* ── Search bar ── */
        .search-bar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .search-input-wrap { position: relative; flex: 1; min-width: 200px; }
        .search-input-wrap .icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 13px; }
        .search-input-wrap input { padding-left: 34px; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); }
            .main { margin-left: 0; }
            .topbar .btn-mobile-menu { display: flex; }
            .content { padding: 16px; }
            .stats-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── Overlay ── */
        .overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 99; }
        .overlay.show { display: block; }

        /* ── Modal ── */
        .modal-backdrop {
            display: none; position: fixed; inset: 0; background: rgba(0,0,0,.5);
            z-index: 200; align-items: center; justify-content: center;
        }
        .modal-backdrop.show { display: flex; }
        .modal {
            background: #fff; border-radius: 16px; padding: 28px; width: 100%; max-width: 460px;
            box-shadow: 0 20px 60px rgba(0,0,0,.2); animation: fadeIn .2s ease;
        }
        .modal-title { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
        .modal-sub   { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
        @keyframes fadeIn { from { opacity:0; transform: scale(.96) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }

        /* ── Utilities ── */
        .flex { display: flex; } .items-center { align-items: center; } .gap-2 { gap: 8px; } .gap-3 { gap: 12px; }
        .ml-auto { margin-left: auto; } .mt-4 { margin-top: 16px; } .mb-4 { margin-bottom: 16px; }
        .text-sm { font-size: 13px; } .text-xs { font-size: 11px; } .text-muted { color: var(--text-muted); }
        .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    </style>
    @stack('styles')
</head>
<body>

<div class="overlay" id="overlay" onclick="closeSidebar()"></div>

<!-- Sidebar -->
<aside class="sidebar" id="sidebar">
    @php
        $companyProfile = \App\Models\Company::first();
        $appName = $companyProfile ? $companyProfile->name : 'SI-SAMPAH';
        $appLogo = $appName ? strtoupper(substr($appName, 0, 1)) : 'S';
    @endphp
    <div class="sidebar-brand">
        <div class="logo">{{ $appLogo }}</div>
        <div>
            <div class="name">{{ $appName }}</div>
            <div class="sub">Admin Panel</div>
        </div>
    </div>

    <nav class="sidebar-nav">
        <div class="nav-section">Main</div>
        <a href="{{ route('dashboard.home') }}" class="nav-item {{ request()->routeIs('dashboard.home') ? 'active' : '' }}">
            <i class="fas fa-chart-pie icon"></i> Dashboard
        </a>

        <div class="nav-section">Manajemen</div>
        <a href="{{ route('dashboard.customers') }}" class="nav-item {{ request()->routeIs('dashboard.customers*') ? 'active' : '' }}">
            <i class="fas fa-users icon"></i> Pelanggan
            @if(($pendingCount = \App\Models\User::where('status','pending')->count()) > 0)
                <span class="badge">{{ $pendingCount }}</span>
            @endif
        </a>
        <a href="{{ route('dashboard.officers') }}" class="nav-item {{ request()->routeIs('dashboard.officers*') ? 'active' : '' }}">
            <i class="fas fa-hard-hat icon"></i> Petugas
        </a>
        <a href="{{ route('dashboard.pickups') }}" class="nav-item {{ request()->routeIs('dashboard.pickups*') ? 'active' : '' }}">
            <i class="fas fa-truck icon"></i> Penjemputan
        </a>
        <a href="{{ route('dashboard.payments') }}" class="nav-item {{ request()->routeIs('dashboard.payments*') ? 'active' : '' }}">
            <i class="fas fa-credit-card icon"></i> Pembayaran
        </a>

        <div class="nav-section">Sistem</div>
        <a href="{{ route('dashboard.users') }}" class="nav-item {{ request()->routeIs('dashboard.users*') ? 'active' : '' }}">
            <i class="fas fa-shield-halved icon"></i> Semua Pengguna
        </a>
    </nav>

    <div class="sidebar-footer">
        <div class="sidebar-user">
            <div class="avatar">{{ strtoupper(substr(Auth::user()->name, 0, 1)) }}</div>
            <div class="info">
                <div class="name">{{ Auth::user()->name }}</div>
                <div class="role">Super Admin</div>
            </div>
            <form method="POST" action="{{ route('dashboard.logout') }}" style="display:inline">
                @csrf
                <button type="submit" class="logout-btn" title="Logout">
                    <i class="fas fa-right-from-bracket"></i>
                </button>
            </form>
        </div>
    </div>
</aside>

<!-- Main -->
<div class="main">
    <!-- Topbar -->
    <header class="topbar">
        <button class="btn btn-ghost btn-sm btn-mobile-menu" onclick="toggleSidebar()">
            <i class="fas fa-bars"></i>
        </button>
        <div class="page-title">@yield('title', 'Dashboard')</div>
        <div class="meta">
            <i class="fas fa-calendar-day"></i>
            {{ now()->isoFormat('dddd, D MMMM Y') }}
        </div>
    </header>

    <!-- Flash Messages -->
    <div style="padding: 0 28px; padding-top: 16px;">
        @if(session('success'))
            <div class="alert alert-success"><i class="fas fa-check-circle"></i> {{ session('success') }}</div>
        @endif
        @if(session('error'))
            <div class="alert alert-error"><i class="fas fa-triangle-exclamation"></i> {{ session('error') }}</div>
        @endif
        @if($errors->any())
            <div class="alert alert-error">
                <i class="fas fa-triangle-exclamation"></i>
                <div>
                    @foreach($errors->all() as $error)
                        <div>{{ $error }}</div>
                    @endforeach
                </div>
            </div>
        @endif
    </div>

    <main class="content">
        @yield('content')
    </main>
</div>

<script>
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
}
</script>
@stack('scripts')
</body>
</html>

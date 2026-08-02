<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login — SI-SAMPAH Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif; min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #134e30 50%, #0f172a 100%);
            display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .login-wrap {
            width: 100%; max-width: 420px;
        }
        .login-header { text-align: center; margin-bottom: 32px; }
        .login-logo {
            width: 68px; height: 68px; background: linear-gradient(135deg, #16a34a, #22c55e);
            border-radius: 20px; display: inline-flex; align-items: center; justify-content: center;
            font-size: 32px; color: white; font-weight: 800; margin-bottom: 16px;
            box-shadow: 0 8px 32px rgba(22,163,74,.4);
        }
        .login-header h1 { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 6px; }
        .login-header p  { font-size: 14px; color: rgba(255,255,255,.55); }

        .login-card {
            background: rgba(255,255,255,.05); backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,.1); border-radius: 20px; padding: 32px;
            box-shadow: 0 24px 64px rgba(0,0,0,.3);
        }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: rgba(255,255,255,.75); margin-bottom: 8px; }
        .input-wrap { position: relative; }
        .input-icon {
            position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
            color: rgba(255,255,255,.35); font-size: 14px;
        }
        .form-control {
            width: 100%; background: rgba(255,255,255,.08); border: 1.5px solid rgba(255,255,255,.12);
            border-radius: 10px; padding: 11px 14px 11px 38px; font-size: 14px; color: #fff;
            outline: none; transition: border-color .2s, background .2s; font-family: inherit;
        }
        .form-control::placeholder { color: rgba(255,255,255,.3); }
        .form-control:focus { border-color: #22c55e; background: rgba(255,255,255,.12); }

        .form-error { font-size: 12px; color: #fca5a5; margin-top: 6px; display: flex; align-items: center; gap: 4px; }

        .remember { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .remember input { accent-color: #22c55e; }
        .remember label { font-size: 13px; color: rgba(255,255,255,.6); }

        .btn-login {
            width: 100%; padding: 13px; background: linear-gradient(135deg, #16a34a, #22c55e);
            border: none; border-radius: 10px; color: #fff; font-size: 15px; font-weight: 700;
            cursor: pointer; font-family: inherit; transition: opacity .2s, transform .1s;
            box-shadow: 0 4px 20px rgba(22,163,74,.4);
        }
        .btn-login:hover { opacity: .95; transform: translateY(-1px); }
        .btn-login:active { transform: translateY(0); }

        .back-link {
            text-align: center; margin-top: 20px;
            font-size: 13px; color: rgba(255,255,255,.4);
        }
        .back-link a { color: rgba(255,255,255,.7); text-decoration: none; }
        .back-link a:hover { color: #22c55e; }
    </style>
</head>
<body>
    <div class="login-wrap">
        <div class="login-header">
            @php
                $companyProfile = \App\Models\Company::first();
                $appName = $companyProfile ? $companyProfile->name : 'SI-SAMPAH';
                $appLogo = $appName ? strtoupper(substr($appName, 0, 1)) : 'S';
            @endphp
            <div class="login-logo">{{ $appLogo }}</div>
            <h1>{{ $appName }} Admin</h1>
            <p>Masuk ke panel administrasi</p>
        </div>

        <div class="login-card">
            @if($errors->any())
                <div style="background:rgba(239,68,68,.15); border:1px solid rgba(239,68,68,.3); border-radius:8px; padding:12px 14px; margin-bottom:16px; font-size:13px; color:#fca5a5; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-triangle-exclamation"></i>
                    {{ $errors->first() }}
                </div>
            @endif

            <form method="POST" action="{{ route('dashboard.login.post') }}">
                @csrf
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <div class="input-wrap">
                        <i class="fas fa-envelope input-icon"></i>
                        <input type="email" name="email" class="form-control"
                               placeholder="admin@sisampah.id" value="{{ old('email') }}" autofocus required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Password</label>
                    <div class="input-wrap">
                        <i class="fas fa-lock input-icon"></i>
                        <input type="password" name="password" class="form-control"
                               placeholder="••••••••" required>
                    </div>
                </div>

                <div class="remember">
                    <input type="checkbox" id="remember" name="remember">
                    <label for="remember">Ingat saya</label>
                </div>

                <button type="submit" class="btn-login">
                    <i class="fas fa-right-to-bracket" style="margin-right:8px;"></i>
                    Masuk ke Dashboard
                </button>
            </form>
        </div>

        <div class="back-link">
            <a href="{{ url('/') }}"><i class="fas fa-arrow-left" style="margin-right:4px;"></i> Kembali ke website</a>
        </div>
    </div>
</body>
</html>

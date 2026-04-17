// ==========================================
// Nexus SSO - 企業級通用門禁套件 v1.1 (嚴格查核版)
// ==========================================

(function() {
    // 🔴 您的中央授權伺服器
    const gasAuthUrl = "https://script.google.com/macros/s/AKfycbwfNkqkJpqI_JHOPmlauEyOQOsB4NixkL8_P0yCfLUzhCLc4cX6FHymFdaSrt4N3XsjvA/exec";
    
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('nexus_auth');
    let isUnlocked = localStorage.getItem('hg_line_auth') === 'true';
    let errorMessage = "";

    // 1. 嚴格狀態檢查與通行證管理
    if (authStatus === 'success') {
        localStorage.setItem('hg_line_auth', 'true');
        isUnlocked = true;
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'failed_not_friend') {
        // 🛡️ 終極修補：如果被抓到不是好友，直接撕毀他可能擁有的舊通行證！
        localStorage.removeItem('hg_line_auth');
        isUnlocked = false; 
        errorMessage = "授權失敗：系統偵測到您尚未加入好友或已封鎖。請重新登入並務必勾選加入好友。";
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. 如果合法解鎖，套件休眠
    if (isUnlocked) return;

    // 3. 畫面注入與鎖定 (與之前相同)
    const style = document.createElement('style');
    style.innerHTML = `
        .nexus-sso-lock-body { overflow: hidden !important; height: 100vh !important; }
        .nexus-sso-overlay { position: fixed; inset: 0; z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; background: linear-gradient(180deg, #0F2E46 0%, #162a3b 100%); color: white; font-family: 'Noto Sans TC', sans-serif; }
        .nexus-sso-card { background: white; color: #1f2937; border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); padding: 2rem; width: 100%; max-width: 24rem; text-align: center; position: relative; overflow: hidden; }
        .nexus-sso-deco { position: absolute; top: -2.5rem; right: -2.5rem; width: 8rem; height: 8rem; background: #C5A065; opacity: 0.1; border-radius: 50%; filter: blur(20px); pointer-events: none; }
        .nexus-sso-icon-box { width: 5rem; height: 5rem; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; border: 4px solid #C5A065; box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); }
        .nexus-sso-title { font-size: 1.5rem; font-weight: bold; color: #0F2E46; margin: 0 0 0.5rem 0; }
        .nexus-sso-desc { font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem; line-height: 1.5; }
        .nexus-sso-btn { width: 100%; background-color: #06C755; color: white; border-radius: 0.75rem; padding: 1rem; font-weight: bold; font-size: 1rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(6, 199, 85, 0.3); }
        .nexus-sso-btn:active { transform: scale(0.95); }
        .nexus-sso-btn:hover { background-color: #05b34c; }
        .nexus-sso-err { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: bold; margin-bottom: 1rem; text-align: left; display: flex; align-items: flex-start; gap: 0.5rem; }
    `;
    document.head.appendChild(style);
    document.body.classList.add('nexus-sso-lock-body'); 

    const overlay = document.createElement('div');
    overlay.className = 'nexus-sso-overlay';
    
    const errHtml = errorMessage ? `<div class="nexus-sso-err"><svg style="width:1rem;height:1rem;flex-shrink:0;margin-top:0.1rem;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg><span>${errorMessage}</span></div>` : '';

    overlay.innerHTML = `
        <div class="nexus-sso-card">
            <div class="nexus-sso-deco"></div>
            <div class="nexus-sso-icon-box">
                <svg style="width:2rem;height:2rem;color:#C5A065;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
            </div>
            <h2 class="nexus-sso-title">宏國專屬系統</h2>
            <p class="nexus-sso-desc">本系統為內部高階工具。<br>為保障服務品質，請透過官方帳號驗證身分。</p>
            ${errHtml}
            <button id="nexus-login-btn" class="nexus-sso-btn">
                <svg style="width:1.5rem;height:1.5rem;margin-right:0.5rem;" viewBox="0 0 24 24" fill="currentColor"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.572-3.843 2.572-5.992z"/></svg>
                使用 LINE 登入並解鎖
            </button>
            <div style="font-size:0.625rem; color:#9ca3af; margin-top:1rem;">經由 LINE OAuth 2.0 安全授權</div>
        </div>
        <div style="margin-top:2rem; font-size:0.75rem; color:#bfdbfe; opacity:0.6; letter-spacing:0.1em;">© 2026 宏國地政 | 易丞地政</div>
    `;
    
    document.body.appendChild(overlay);

    // 4. 綁定登入事件
    document.getElementById('nexus-login-btn').addEventListener('click', () => {
        const currentBaseUrl = window.location.origin + window.location.pathname;
        window.location.href = `${gasAuthUrl}?state=${encodeURIComponent(currentBaseUrl)}`;
    });
})();

document.addEventListener('DOMContentLoaded', function () {
    checkAuthenticationStatus();
    function checkAuthenticationStatus() {
        fetch('/user-status')
            .then(response => {
                if (response.status === 200) {
                } else {
                    window.location.href = 'login.html';
                }
            })
            .catch(error => {
                console.error('Ошибка при проверке статуса авторизации:', error);
            });
    }
});

function openAvatarPanel() {
    const avatarPanel = document.getElementById('avatar-panel');
    avatarPanel.style.display = 'block';
}

function closeAvatarPanel() {
    const avatarPanel = document.getElementById('avatar-panel');
    avatarPanel.style.display = 'none';
}

fetch('/user-info')
  .then(response => response.json())
  .then(userData => {
    document.getElementById('user-name').textContent = userData.login;
    document.getElementById('user-avatar').src = `avatars/${userData.avatar_path}`;
    console.log(userData.avatar_path);
  })
  .catch(error => {
    console.error('Ошибка при получении данных о пользователе:', error);
  });
import API_CONFIG from '../config/api';

export const getUserProfile = async () => {
  const token = localStorage.getItem('access_token');

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();
    } else if (response.status === 401) {
      // Логика обновления токена или редирект на логин
      throw new Error('Unauthorized');
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
};
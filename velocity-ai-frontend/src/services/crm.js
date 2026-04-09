export const sendToCrm = async (data) => {
  // Пример отправки в AmoCRM через встроенную форму
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('phone', data.phone);
  formData.append('company', data.company || '');
  formData.append('project_type', data.projectType);
  formData.append('budget', data.budget || '');
  formData.append('payment_system', data.paymentSystem || '');
  formData.append('contact_method', data.contactMethod);
  formData.append('message', data.message);

  // Укажите URL вашей CRM-формы (например, вебхук AmoForms)
  const response = await fetch('https://your-crm.ru/api/v4/leads', {
    method: 'POST',
    body: formData,
    // Если требуется авторизация, добавьте заголовки
  });

  if (!response.ok) {
    throw new Error('CRM send failed');
  }
  return response.json();
};
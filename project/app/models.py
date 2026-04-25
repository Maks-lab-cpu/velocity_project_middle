from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    GENDER_CHOICES = [('male', 'Мужской'), ('female', 'Женский')]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', verbose_name="Пользователь")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Телефон для связи")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True, default='male',
                              verbose_name="Пол")
    class Meta:
        verbose_name = "Аккаунт"
        verbose_name_plural = "Аккаунты"
    def __str__(self):
        return f"Аккаунт: {self.user.username}"

class Category(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название")
    slug = models.SlugField(unique=True, verbose_name="Слаг (URL)")
    icon = models.ImageField(upload_to='icons/', blank=True, null=True, verbose_name="Иконка")
    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products', verbose_name="Категория")
    title = models.CharField(max_length=255, verbose_name="Название")
    brand = models.CharField(max_length=255, blank=True, null=True, verbose_name="Бренд")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена")
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name="Цена со скидкой")
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, verbose_name="Рейтинг")
    review_count = models.PositiveIntegerField(default=0, verbose_name="Количество отзывов")
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Изображение")
    stock = models.PositiveIntegerField(default=0, verbose_name="Запас на складе")
    in_stock = models.BooleanField(default=True, verbose_name="В наличии")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
    def __str__(self):
        return self.title

class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart', verbose_name="Пользователь")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Количество")
    added_at = models.DateTimeField(auto_now_add=True, verbose_name="Добавлено")
    class Meta:
        verbose_name = "Товар в корзине"
        verbose_name_plural = "Товары в корзине"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает оплаты'),
        ('paid', 'Оплачен'),
        ('shipped', 'Отправлен'),
        ('delivered', 'Доставлен'),
        ('cancelled', 'Отменен'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', verbose_name="Пользователь")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Статус")
    is_paid = models.BooleanField(default=False, verbose_name="Оплачено")
    total_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Общая стоимость")
    delivery_address = models.CharField(max_length=500, verbose_name="Адрес доставки")
    phone = models.CharField(max_length=20, verbose_name="Телефон для связи")
    email = models.EmailField(verbose_name="Email для уведомлений")
    comment = models.TextField(blank=True, null=True, verbose_name="Комментарий к заказу")
    promo_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="Промокод")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Сумма скидки")
    delivery_method = models.CharField(max_length=50, default='standard', verbose_name="Способ доставки")
    payment_method = models.CharField(max_length=50, default='card', verbose_name="Способ оплаты")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ['-created_at']
    def __str__(self):
        return f"Заказ #{self.id} - {self.user.username}"
    def can_be_paid(self):
        return self.status == 'pending' and not self.is_paid and self.payment_method != 'cash'
    def get_payment_method_display(self):
        displays = {'card': 'Банковская карта (онлайн)', 'crypto': 'Криптовалюта', 'cash': 'Наличные / карта курьеру'}
        return displays.get(self.payment_method, self.payment_method)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name="Заказ")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    quantity = models.PositiveIntegerField(verbose_name="Количество")
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена при покупке")
    def __str__(self):
        return f"{self.product.title} (x{self.quantity})"

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites', verbose_name="Пользователь")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    added_at = models.DateTimeField(auto_now_add=True, verbose_name="Добавлено")
    class Meta:
        verbose_name = "Избранное"
        verbose_name_plural = "Список избранного"
        unique_together = ('user', 'product')

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
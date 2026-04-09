import re
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Product, Category, CartItem, Order, OrderItem, Favorite
class UserProfileSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='profile.phone', allow_blank=True, required=False)
    gender = serializers.CharField(source='profile.gender', allow_blank=True, required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'gender', 'username']
        read_only_fields = ['username']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        profile, _ = Profile.objects.get_or_create(user=instance)
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    gender = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'phone', 'gender']

    # 1. Валидация логина
    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Логин должен быть не менее 3 символов.")

        if '@' not in value:
            if not re.match(r'^[\w.@+-]+$', value):
                raise serializers.ValidationError("Логин содержит недопустимые символы.")

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Этот логин уже занят.")
        return value

    # 2. Валидация сложности пароля
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Пароль должен быть не менее 8 символов.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Добавьте в пароль хотя бы одну цифру.")
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError("Добавьте в пароль хотя бы одну букву.")
        return value

    # 3. Распределение identifier (username/email) и валидация почты
    def validate(self, data):
        identifier = data.get('username')

        if '@' in identifier:
            # Простая регулярка для проверки формата почты
            email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
            if not re.match(email_regex, identifier):
                raise serializers.ValidationError({"username": "Введите корректный формат Email."})

            data['email'] = identifier
            if User.objects.filter(email=identifier).exists():
                raise serializers.ValidationError({"username": "Эта почта уже зарегистрирована."})
        else:
            # Если ввели просто никнейм, создаем системный email
            data['email'] = f"{identifier}@velocity.local"

        return data

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        gender = validated_data.pop('gender', 'male')

        # Создаем пользователя
        user = User.objects.create_user(**validated_data)

        # Назначаем статус персонала (зеленая галочка в админке)
        user.is_staff = True
        user.save()

        # Наполняем профиль (создается через сигнал в models.py)
        profile = user.profile
        profile.phone = phone
        profile.gender = gender
        profile.save()

        return user


# --- СЕРИАЛИЗАТОРЫ МАГАЗИНА ---

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_details', 'quantity']


class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price_at_purchase', 'product_details']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'total_price', 'is_paid', 'created_at', 'items']


class FavoriteSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'product', 'product_details']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['product'] = instance.product.id
        return representation
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
        fields = ['email', 'password', 'first_name', 'last_name', 'phone', 'gender']

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email обязателен.")
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, value):
            raise serializers.ValidationError("Введите корректный email.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Этот email уже зарегистрирован.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Пароль должен быть не менее 8 символов.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Добавьте в пароль хотя бы одну цифру.")
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError("Добавьте в пароль хотя бы одну букву.")
        return value

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        phone = validated_data.pop('phone', '')
        gender = validated_data.pop('gender', 'male')

        # Генерируем username из email (всё до @)
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        profile = user.profile
        profile.phone = phone
        profile.gender = gender
        profile.save()
        return user


# Остальные сериализаторы без изменений
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
    product_title = serializers.ReadOnlyField(source='product.title')
    product_image = serializers.ImageField(source='product.image', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_title', 'product_image', 'quantity', 'price_at_purchase']


class OrderCreateSerializer(serializers.Serializer):
    delivery_address = serializers.CharField(max_length=500)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    comment = serializers.CharField(required=False, allow_blank=True)
    promo_code = serializers.CharField(required=False, allow_blank=True)
    delivery_method = serializers.CharField(default='standard')
    payment_method = serializers.CharField(default='crypto')


class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['delivery_address', 'phone', 'comment', 'delivery_method', 'payment_method']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'is_paid', 'total_price', 'delivery_address', 'phone', 'email',
            'comment', 'promo_code', 'discount_amount', 'delivery_method',
            'payment_method', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'status', 'is_paid', 'total_price', 'discount_amount', 'created_at', 'updated_at']


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
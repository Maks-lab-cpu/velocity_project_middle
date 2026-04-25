from django.db import transaction
from rest_framework import viewsets, filters, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from .models import Product, Category, CartItem, Order, OrderItem, Favorite
from .serializers import (
    ProductSerializer, CategorySerializer, CartItemSerializer, RegisterSerializer,
    UserProfileSerializer, OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer, FavoriteSerializer
)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = {'category': ['exact'], 'discount_price': ['gte', 'lte'], 'brand': ['exact']}
    search_fields = ['title', 'brand']

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class FavoriteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteSerializer
    pagination_class = None
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('product')
    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product')
        if not product_id:
            return Response({'detail': 'ID товара не указан'}, status=status.HTTP_400_BAD_REQUEST)
        favorite = Favorite.objects.filter(user=request.user, product_id=product_id).first()
        if favorite:
            favorite.delete()
            return Response({'detail': 'Удалено', 'added': False}, status=status.HTTP_200_OK)
        else:
            new_fav = Favorite.objects.create(user=request.user, product_id=product_id)
            serializer = self.get_serializer(new_fav)
            data = serializer.data
            data['added'] = True
            return Response(data, status=status.HTTP_201_CREATED)

class CartViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer
    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related('product')
    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product')
        quantity = int(request.data.get('quantity', 1))
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product_id=product_id,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        return Response(self.get_serializer(cart_item).data)

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product').order_by('-id')
    def create(self, request, *args, **kwargs):
        create_serializer = OrderCreateSerializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        validated_data = create_serializer.validated_data
        user = request.user
        cart_items = CartItem.objects.filter(user=user).select_related('product')
        if not cart_items.exists():
            return Response({'detail': 'Корзина пуста'}, status=status.HTTP_400_BAD_REQUEST)
        order_items_data = []
        total = 0
        for item in cart_items:
            product = item.product
            price = product.discount_price or product.price
            total += price * item.quantity
            order_items_data.append({
                'product': product,
                'quantity': item.quantity,
                'price_at_purchase': price,
            })
        phone = validated_data.get('phone', '')
        if not phone and hasattr(user, 'profile') and user.profile.phone:
            phone = user.profile.phone
        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                total_price=total,
                is_paid=False,
                delivery_address=validated_data['delivery_address'],
                phone=phone,
                email=validated_data.get('email', user.email),
                comment=validated_data.get('comment', ''),
                promo_code=validated_data.get('promo_code', ''),
                delivery_method=validated_data.get('delivery_method', 'standard'),
                payment_method=validated_data.get('payment_method', 'card'),
            )
            OrderItem.objects.bulk_create([OrderItem(order=order, **data) for data in order_items_data])
            cart_items.delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
    def update(self, request, *args, **kwargs):
        order = self.get_object()
        if order.is_paid or order.status != 'pending':
            return Response({'error': 'Нельзя редактировать оплаченный заказ'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = OrderUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(order).data)
    def destroy(self, request, *args, **kwargs):
        order = self.get_object()
        if order.is_paid or order.status != 'pending':
            return Response({'error': 'Нельзя удалить оплаченный заказ'}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)
    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        order = self.get_object()
        if not order.can_be_paid():
            return Response({'error': 'Заказ уже оплачен или не может быть оплачен'}, status=status.HTTP_400_BAD_REQUEST)
        order.is_paid = True
        order.status = 'paid'
        order.save()
        return Response({'order_id': order.id, 'status': order.status, 'message': 'Заказ успешно оплачен'})

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return User.objects.select_related('profile').get(id=self.request.user.id)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
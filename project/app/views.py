from rest_framework import viewsets, filters, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from .models import Product, Category, CartItem, Order, OrderItem, Favorite
from .serializers import (
    ProductSerializer, CategorySerializer, CartItemSerializer,
    RegisterSerializer, UserProfileSerializer, OrderSerializer, FavoriteSerializer
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

# --- ИЗБРАННОЕ (ТОЧНО РАБОЧЕЕ) ---
class FavoriteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteSerializer
    pagination_class = None # В избранном обычно не нужна пагинация

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('product')

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product')
        if not product_id:
            return Response({'detail': 'ID товара не указан'}, status=status.HTTP_400_BAD_REQUEST)

        # Проверяем, существует ли уже этот товар в избранном у юзера
        favorite = Favorite.objects.filter(user=request.user, product_id=product_id).first()

        if favorite:
            # Если есть — удаляем (Toggle off)
            favorite.delete()
            return Response({'detail': 'Удалено', 'added': False}, status=status.HTTP_200_OK)
        else:
            # Если нет — создаем (Toggle on)
            new_fav = Favorite.objects.create(user=request.user, product_id=product_id)
            serializer = self.get_serializer(new_fav)
            data = serializer.data
            data['added'] = True
            return Response(data, status=status.HTTP_201_CREATED)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

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
        user = request.user
        cart_items = CartItem.objects.filter(user=user)
        if not cart_items.exists():
            return Response({'detail': 'Корзина пуста'}, status=status.HTTP_400_BAD_REQUEST)

        total = sum(item.product.discount_price * item.quantity for item in cart_items)
        order = Order.objects.create(user=user, total_price=total)

        OrderItem.objects.bulk_create([
            OrderItem(order=order, product=item.product, quantity=item.quantity,
                      price_at_purchase=item.product.discount_price) for item in cart_items
        ])
        cart_items.delete()
        return Response(self.get_serializer(order).data, status=status.HTTP_201_CREATED)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return User.objects.select_related('profile').get(id=self.request.user.id)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
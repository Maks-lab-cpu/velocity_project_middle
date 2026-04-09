import React, { useEffect, useState } from "react";
import api from "../api/axios";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await api.get("/orders/");
            const data = res.data.results || res.data;
            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                setOrders([]);
            }

        } catch (err) {
            console.error("Ошибка загрузки заказов", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Загрузка...</p>;

    return (
        <div style={{ padding: "30px" }}>

            <h2>Мои заказы</h2>

            {orders.length === 0 && (
                <p>У вас пока нет заказов</p>
            )}

            {orders.map(order => (

                <div
                    key={order.id}
                    style={{
                        border: "1px solid #eee",
                        borderRadius: "12px",
                        padding: "15px",
                        marginBottom: "15px"
                    }}
                >

                    <div style={{ fontWeight: "700" }}>
                        Заказ №{order.id}
                    </div>
                    <div>
                        {order.total_price} BYN
                    </div>
                    <div
                        style={{
                            color: order.is_paid ? "green" : "orange",
                            fontWeight: "600"
                        }}
                    >
                        {order.is_paid ? "Оплачен" : "Ожидает оплаты"}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrdersPage;
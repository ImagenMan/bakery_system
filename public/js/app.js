const socket = io();

const status = document.getElementById("status");

async function loadOrders() {
    try {
        const response = await fetch("/api/orders");
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Failed to load orders.");
        }

        console.log("Orders loaded:", result.data);

        status.textContent = `Connected — ${result.data.length} orders loaded`;
    } catch (error) {
        console.error("Failed to load orders:", error);
        status.textContent = "Connected, but failed to load orders.";
    }
}

socket.on("connect", () => {
    console.log("Socket.io connected:", socket.id);
    loadOrders();
});

socket.on("disconnect", () => {
    console.log("Socket.io disconnected.");
    status.textContent = "Disconnected";
});
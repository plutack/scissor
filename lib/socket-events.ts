import * as userService from "../services/user-service";

export const setupSocketEvents = (socket: any, log: any) => {
  socket.on("getDashboardData", async () => {
    log.info("Received getDashboardData request from client");
    try {
      const dashboardData = await userService.getUserStats(socket.data.user.id);
      log.info("Sending dashboard data event to client");
      socket.emit("dashboardData", dashboardData);
    } catch (error) {
      log.error("Error fetching dashboard data:", error);
      socket.emit("dashboardError", "Failed to fetch dashboard data");
    }
  });
};
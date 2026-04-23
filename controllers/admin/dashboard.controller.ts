import { Request, Response } from "express";

export const index = async (req: Request, res: Response) => {
    try {
        res.json({
            success: true,
            data: {
                statistics: {
                    totalRevenue: 0,
                    totalOrders: 0,
                    totalProducts: 0,
                    totalArticles: 0
                },
                recentActivity: []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
}

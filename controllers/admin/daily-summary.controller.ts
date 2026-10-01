import { Request, Response } from "express";
import DailySummary from "../../models/daily-summary.model";
import Blog from "../../models/blog.model";
import MindMap from "../../models/mind-map.model";
import Vocabulary from "../../models/vocabulary.model";
import moment from "moment";

// [GET] /admin/daily-summaries/today-content?date=...
export const getTodayContent = async (req: Request, res: Response) => {
    try {
        const dateStr = req.query.date as string;
        const date = moment(dateStr).startOf('day');
        const nextDay = moment(date).add(1, 'days');
        const userId = (req as any).user.id;

        const query = {
            createdBy: userId, // Tên trường có thể khác tùy model, tôi sẽ check lại
            createdAt: {
                $gte: date.toDate(),
                $lt: nextDay.toDate()
            },
            deleted: false
        };

        // Một số model dùng createdBy, một số dùng userId. Tôi sẽ sử dụng đúng trường cho từng cái.
        const [blogs, mindMaps, vocabularies] = await Promise.all([
            Blog.find({ createdBy: userId, createdAt: query.createdAt, deleted: false }).select("name createdAt"),
            MindMap.find({ userId: userId, createdAt: query.createdAt, deleted: false }).select("title createdAt"),
            Vocabulary.find({ createdBy: userId, createdAt: query.createdAt, deleted: false }).select("word createdAt")
        ]);

        res.json({
            code: 200,
            data: {
                blogs: blogs.map(b => ({ id: b._id, title: (b as any).name, type: 'blog' })),
                mindMaps: mindMaps.map(m => ({ id: m._id, title: m.title, type: 'mind-map' })),
                vocabularies: vocabularies.map(v => ({ id: v._id, title: (v as any).word, type: 'vocabulary' }))
            }
        });
    } catch (error) {
        console.error(error);
        res.json({
            code: 400,
            message: "Lỗi khi lấy dữ liệu trong ngày"
        });
    }
};

// [GET] /admin/daily-summaries/getByDate?date=...
export const getByDate = async (req: Request, res: Response) => {
    try {
        const dateStr = req.query.date as string;
        const date = moment(dateStr).startOf('day').toDate();
        const userId = (req as any).user.id;

        const summary = await DailySummary.findOne({ date, userId, deleted: false });

        res.json({
            code: 200,
            data: summary
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi khi lấy bản tổng kết"
        });
    }
};

// [POST] /admin/daily-summaries/upsert
export const upsert = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const date = moment(req.body.date).startOf('day').toDate();
        
        const summary = await DailySummary.findOneAndUpdate(
            { date, userId },
            { 
                ...req.body, 
                date, 
                userId,
                deleted: false 
            },
            { upsert: true, new: true }
        );

        res.json({
            code: 200,
            message: "Lưu bản tổng kết thành công",
            data: summary
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi khi lưu bản tổng kết"
        });
    }
};

// [GET] /admin/daily-summaries/statistics
export const getStatistics = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const todayStart = moment().startOf('day').toDate();
        const yesterdayStart = moment().subtract(1, 'days').startOf('day').toDate();
        const yesterdayEnd = moment().subtract(1, 'days').endOf('day').toDate();
        const thisWeekStart = moment().startOf('isoWeek').toDate();
        const nextDay = moment().startOf('day').add(1, 'days').toDate();

        const countForRange = async (start: Date, end: Date) => {
            const [blogs, mindMaps, vocabularies] = await Promise.all([
                Blog.countDocuments({ createdBy: userId, createdAt: { $gte: start, $lt: end }, deleted: false }),
                MindMap.countDocuments({ userId: userId, createdAt: { $gte: start, $lt: end }, deleted: false }),
                Vocabulary.countDocuments({ createdBy: userId, createdAt: { $gte: start, $lt: end }, deleted: false })
            ]);
            return { blogs, mindMaps, vocabularies };
        };

        const todayStats = await countForRange(todayStart, nextDay);
        const yesterdayStats = await countForRange(yesterdayStart, yesterdayEnd);
        const thisWeekStats = await countForRange(thisWeekStart, nextDay);

        res.json({
            code: 200,
            data: {
                today: todayStats,
                yesterday: yesterdayStats,
                thisWeek: thisWeekStats
            }
        });
    } catch (error) {
        console.error(error);
        res.json({
            code: 400,
            message: "Lỗi khi lấy thống kê"
        });
    }
};

import { Router } from 'express';
import * as controller from '../../controllers/admin/nutrition.controller';

const router: Router = Router();

router.get('/', controller.index);
router.post('/save', controller.save);

export const nutritionRoutes: Router = router;

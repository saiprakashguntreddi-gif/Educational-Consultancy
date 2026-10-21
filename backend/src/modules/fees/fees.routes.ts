import { Router } from 'express';
import { FeesController } from './fees.controller';

const router = Router();

// Public & student advisory endpoints
router.get('/meta', FeesController.getMeta);
router.get('/tier-summary', FeesController.getTierSummary);
router.get('/colleges', FeesController.getColleges);
router.post('/calculate', FeesController.calculate);
router.post('/compare', FeesController.compare);
router.post('/budget-decision', FeesController.saveBudgetDecision);

export const feesRouter = router;

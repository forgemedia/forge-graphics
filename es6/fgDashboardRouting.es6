import Express from 'express';

let router = Express.Router();

router.get(/^\/templates\/(\w+)(\.html)?/,
    (req, res) => res.render(`dash/templates/${req.params[0]}`));

router.get('/', (req, res) => res.render('dash/index'));

export default router;

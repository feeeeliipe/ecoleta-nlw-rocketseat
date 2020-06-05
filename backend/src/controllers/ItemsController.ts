import knex from '../database/connection';
import { Request, Response } from 'express'

class ItemsController {

    async index(req: Request, res: Response) {
        const items = await knex('items').select('*');
        const serealizedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://localhost:3333/uploads/${item.image}`
            };
        })
        return res.json(serealizedItems);
    }

}

export default new ItemsController();
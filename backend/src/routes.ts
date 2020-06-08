import express, { response } from 'express';
import { celebrate, Joi } from 'celebrate';

import multer from 'multer';
import multerConfig from './config/multer';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();
const upload = multer(multerConfig);

/*
Padrão para o nome de metodos dos controllers

index - Lista todos os recursos
show - Lista um único recurso
create - Cria um recurso
update - Atualiza um recurso
delete - Deleta um recurso 
*/

// List all items
routes.get('/items', ItemsController.index);

// Create points 
routes.post('/points', 
            upload.single('image'), 
            celebrate({
                body: Joi.object().keys({
                    name: Joi.string().required(),
                    email: Joi.string().required().email(),
                    whatsapp: Joi.number().required(),
                    latitude: Joi.number().required(),
                    longitude: Joi.number().required(),
                    city: Joi.string().required(),
                    uf: Joi.string().required().max(2),
                    items: Joi.string().required()
                })
            }, {
                // Esse parametro indica que devem ser validados todos os campos de uma vez
                abortEarly: false
            }),
            PointsController.create);


// List points with filters
routes.get('/points', PointsController.index);
// List one point
routes.get('/points/:id', PointsController.show);
// Delete points
routes.delete('/points/:id', PointsController.delete);

export default routes;
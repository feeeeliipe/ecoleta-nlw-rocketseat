import express, { response } from 'express';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();

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
routes.post('/points', PointsController.create);
// List points with filters
routes.get('/points', PointsController.index);
// List one point
routes.get('/points/:id', PointsController.show);
// Delete points
routes.delete('/points/:id', PointsController.delete);

export default routes;
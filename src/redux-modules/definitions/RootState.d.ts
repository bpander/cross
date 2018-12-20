import { RouterState } from 'connected-react-router';

import BoardState from 'redux-modules/definitions/BoardState';

export default interface RootState {
  board: BoardState;
  router: RouterState;
}

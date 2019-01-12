import { RouterState } from 'connected-react-router';

import BoardState from 'redux-modules/definitions/BoardState';
import DictionaryState from 'redux-modules/definitions/DictionaryState';

export default interface RootState {
  board: BoardState;
  dictionary: DictionaryState;
  router: RouterState;
}

import { RouterState } from 'connected-react-router';

import BoardState from 'redux-modules/definitions/BoardState';
import DictionaryState from 'redux-modules/definitions/DictionaryState';
import EditorState from 'redux-modules/definitions/EditorState';

export default interface RootState {
  editor: EditorState;
  dictionary: DictionaryState;
  router: RouterState;
}

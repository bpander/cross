import ShapeState from 'redux-modules/definitions/ShapeState';
import BoardState from 'redux-modules/definitions/BoardState';

export default interface EditorState {
  shape: ShapeState;
  board: BoardState;
}

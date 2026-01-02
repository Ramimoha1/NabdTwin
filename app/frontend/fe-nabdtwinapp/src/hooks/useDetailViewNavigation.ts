import { useDispatch } from 'react-redux';
import { clearSubSelections } from '../store/visual/visualSlice';

export function useDetailViewNavigation() {
  const dispatch = useDispatch();

  const back = () => {
    dispatch(clearSubSelections());
  };

  return {
    back
  };
}

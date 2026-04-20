import { useDispatch } from 'react-redux';
import { pushToast } from '../store/slices/toastSlice';

export default function useToast() {
  const dispatch = useDispatch();

  const notify = ({ type = 'info', title = 'Notice', message = '', duration = 3600 }) => {
    dispatch(pushToast({ type, title, message, duration }));
  };

  return {
    notify,
    notifySuccess: (title, message, duration) => notify({ type: 'success', title, message, duration }),
    notifyError: (title, message, duration) => notify({ type: 'error', title, message, duration }),
    notifyWarning: (title, message, duration) => notify({ type: 'warning', title, message, duration }),
    notifyInfo: (title, message, duration) => notify({ type: 'info', title, message, duration })
  };
}
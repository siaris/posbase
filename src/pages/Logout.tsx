import { useEffect } from 'react';
import * as helper from '../utils/helper';

export default function Logout(): null {
  useEffect(() => {
    // Hapus token dari cookie
    helper.deleteCookie(window.location.hostname+':token');

    // Arahkan kembali ke login (dengan reload penuh)
    window.location.href = '/login';
  }, []);

  return null;
}

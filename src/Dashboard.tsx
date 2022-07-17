import { StorageKey } from './version';
import { dbGetAllFeedback } from './firebase';

export const Dashboard = () => {
    dbGetAllFeedback(StorageKey);
    return (
        <span>
            dashboard is WIP
        </span>
    )
}

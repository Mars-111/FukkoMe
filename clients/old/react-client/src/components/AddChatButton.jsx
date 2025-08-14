import AddChatMenu from "./AddChatMenu";
import { useAppContext } from "../AppContext";
import "./AddChatMenu.css";


export default function AddChatButton() {
    const {isAddChatVisible, setIsAddChatVisible} = useAppContext();
    return (
        <>
        <button onClick={() => setIsAddChatVisible(true)}>
            Найти чат
        </button>
        {isAddChatVisible&& <AddChatMenu/>}
        </>
    );

}
import Gui from "./components/Gui";
import { SettingsProvider } from "./contexts/SettingsProvider";

function App() {
  return (
    <SettingsProvider>
      <Gui />
    </SettingsProvider>
  );
}

export default App;

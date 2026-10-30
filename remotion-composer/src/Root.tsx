import { Composition } from "remotion";
import { GoldenDrop } from "./golden/GoldenDrop";
import { GOLDEN_DURATION } from "./golden/core";
import { GoldenDrop2 } from "./golden2/GoldenDrop2";
import { ParadiseTea } from "./paradise/ParadiseTea";
import { TeaBag } from "./teabag/TeaBag";
import { TEABAG_DURATION } from "./teabag/core";
import { EnglishBreakfast } from "./englishbreakfast/EnglishBreakfast";
import { ENGLISHBREAKFAST_DURATION } from "./englishbreakfast/core";
import { MimamoriKoe } from "./mimamorikoe/MimamoriKoe";
import { MIMAMORIKOE_DURATION } from "./mimamorikoe/core";
import { TeaTimes } from "./teatimes/TeaTimes";
import { TEATIMES_DURATION } from "./teatimes/core";
import { HighTea } from "./hightea/HighTea";
import { HIGHTEA_DURATION } from "./hightea/core";
import { ChaiMilkTea } from "./chaimilk/ChaiMilkTea";
import { CHAIMILK_DURATION } from "./chaimilk/core";
import { GoldenDrop3 } from "./goldendrop3/GoldenDrop3";
import { GOLDENDROP3_DURATION } from "./goldendrop3/core";
import { SnsYuukai } from "./snsyuukai/SnsYuukai";
import { SNSYUUKAI_DURATION } from "./snsyuukai/core";
import { CookieTea } from "./cookietea/CookieTea";
import { COOKIETEA_DURATION } from "./cookietea/core";
import { CameraHack } from "./camerahack/CameraHack";
import { CAMERAHACK_DURATION } from "./camerahack/core";
import { Chagee } from "./chagee/Chagee";
import { CHAGEE_DURATION } from "./chagee/core";
import { ChatKondate } from "./chatkondate/ChatKondate";
import { CHATKONDATE_DURATION } from "./chatkondate/core";
import { MilkTeaLatte } from "./milktealatte/MilkTeaLatte";
import { MILKTEALATTE_DURATION } from "./milktealatte/core";
import { KurenaiTea } from "./kurenai/KurenaiTea";
import { KURENAI_DURATION } from "./kurenai/core";
import { RoyalMilkTea } from "./royalmilk/RoyalMilkTea";
import { ROYALMILK_DURATION } from "./royalmilk/core";
import { AiKyouhaku } from "./kyouhaku/AiKyouhaku";
import { KYOUHAKU_DURATION } from "./kyouhaku/core";
import { AiKondate } from "./kondate/AiKondate";
import { KONDATE_DURATION } from "./kondate/core";
import { AiMukae } from "./aimukae/AiMukae";
import { AIMUKAE_DURATION } from "./aimukae/core";
import { PARADISE_DURATION } from "./paradise/core";

// Narration reels only. scaffold_remotion.py registers new compositions after the ParadiseTea line.
export const Root: React.FC = () => {
  return (
    <>
      <Composition id="GoldenDrop" component={GoldenDrop} durationInFrames={GOLDEN_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="GoldenDrop2" component={GoldenDrop2} durationInFrames={GOLDEN_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="TeaBag" component={TeaBag} durationInFrames={TEABAG_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="ParadiseTea" component={ParadiseTea} durationInFrames={PARADISE_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="EnglishBreakfast" component={EnglishBreakfast} durationInFrames={ENGLISHBREAKFAST_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="MimamoriKoe" component={MimamoriKoe} durationInFrames={MIMAMORIKOE_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="TeaTimes" component={TeaTimes} durationInFrames={TEATIMES_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="HighTea" component={HighTea} durationInFrames={HIGHTEA_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="ChaiMilkTea" component={ChaiMilkTea} durationInFrames={CHAIMILK_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="GoldenDrop3" component={GoldenDrop3} durationInFrames={GOLDENDROP3_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="SnsYuukai" component={SnsYuukai} durationInFrames={SNSYUUKAI_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="CookieTea" component={CookieTea} durationInFrames={COOKIETEA_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="CameraHack" component={CameraHack} durationInFrames={CAMERAHACK_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="Chagee" component={Chagee} durationInFrames={CHAGEE_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="ChatKondate" component={ChatKondate} durationInFrames={CHATKONDATE_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="MilkTeaLatte" component={MilkTeaLatte} durationInFrames={MILKTEALATTE_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="KurenaiTea" component={KurenaiTea} durationInFrames={KURENAI_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="RoyalMilkTea" component={RoyalMilkTea} durationInFrames={ROYALMILK_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="AiKyouhaku" component={AiKyouhaku} durationInFrames={KYOUHAKU_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="AiKondate" component={AiKondate} durationInFrames={KONDATE_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="AiMukae" component={AiMukae} durationInFrames={AIMUKAE_DURATION} fps={30} width={1080} height={1920} />
    </>
  );
};

import { hardCleanUpBotMessage } from "@/utils/bot";
import { CHANNEL_ID, PUBLIC_CHANNEL_ID } from "@/utils/env";
import { teleBot } from "..";
import { hypeNewPairs } from "@/vars/tokens";
import { errorHandler, log } from "@/utils/handlers";
import { PhotonPairData } from "@/types/livePairs";
import { promoText } from "@/vars/promo";
import { PUBLIC_CHANNEL_DELAY } from "@/utils/constants";

export async function trackLpBurn(pair: PhotonPairData) {
  try {
    if (!CHANNEL_ID) {
      log("CHANNEL_ID is undefined");
      process.exit(1);
    }

    const { address, tokenAddress, symbol, audit } = pair.attributes;
    const { lp_burned_perc } = audit;
    const { lpStatus, launchMessage, ...rest } = hypeNewPairs[tokenAddress];
    const isLpStatusOkay = lp_burned_perc === 100;

    if (!lpStatus && isLpStatusOkay) {
      hypeNewPairs[tokenAddress] = {
        lpStatus: true,
        launchMessage,
        ...rest,
      };

      // Links
      const tokenLink = `https://solscan.io/token/${tokenAddress}`;
      const dexScreenerLink = `https://dexscreener.com/solana/${address}`;
      const birdEyeLink = `https://birdeye.so/token/${tokenAddress}?chain=solana`;
      const photonLink = `https://photon-sol.tinyastro.io/en/r/@solhypealerts/${tokenAddress}`;

      const text = `Powered By [Solana Hype Alerts](https://t.me/SolanaHypeTokenAlerts)
      
[${hardCleanUpBotMessage(symbol)}](${tokenLink}) LP tokens burnt 🔥🔥🔥 

[Photon](${photonLink})
[DexScreener](${dexScreenerLink}) \\| [BirdEye](${birdEyeLink})${promoText}`;

      teleBot.api
        .sendMessage(CHANNEL_ID, text, {
          parse_mode: "MarkdownV2",
          // @ts-expect-error Param not found
          disable_web_page_preview: true,
          reply_parameters: { message_id: launchMessage },
        })
        .then(() => log(`Sent message for ${address}`))
        .catch((e) => {
          log(text);
          errorHandler(e);
        });

      setTimeout(() => {
        if (PUBLIC_CHANNEL_ID)
          teleBot.api.sendMessage(PUBLIC_CHANNEL_ID, text, {
            parse_mode: "MarkdownV2",
            // @ts-expect-error Param not found
            disable_web_page_preview: true,
          });
      }, PUBLIC_CHANNEL_DELAY * 1e3);
    }
  } catch (error) {
    errorHandler(error);
  }
}

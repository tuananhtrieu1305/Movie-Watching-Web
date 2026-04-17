import { useEffect, useState } from "react";
import { message } from "antd";
import { useParams, useSearchParams } from "react-router-dom";
import { getWatchDataBySlug } from "../../services/watchService";
import { calcTargetSeasonIdAndTargetEpisodes } from "../../utils/streaming/common";

export const useWatchPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();

  const currentEpNumber = searchParams.get("ep");
  const currentSeasonParam = searchParams.get("ss");

  const [loading, setLoading] = useState(true);
  const [productionData, setProductionData] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [currentSeasonId, setCurrentSeasonId] = useState(null);
  const [episodeList, setEpisodeList] = useState([]);

  const [playerSettings, setPlayerSettings] = useState({
    autoPlay: true,
    autoNext: true,
    autoSkipIntro: false,
  });
  const [isLightOff, setLightOff] = useState(false);

  // --- EFFECT 1: FETCH INITIAL DATA ---
  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);

      try {
        const data = await getWatchDataBySlug(slug, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (!data) {
          setProductionData(null);
          setCurrentEpisode(null);
          setCurrentSeasonId(null);
          setEpisodeList([]);
          return;
        }

        setProductionData(data.production);

        const { targetSeasonId, targetEpisodes } =
          calcTargetSeasonIdAndTargetEpisodes(data, currentSeasonParam);

        setCurrentSeasonId(targetSeasonId ?? null);
        setEpisodeList(Array.isArray(targetEpisodes) ? targetEpisodes : []);

        // Logic xác định Episode từ URL
        if (currentEpNumber && Array.isArray(targetEpisodes)) {
          const foundEp = targetEpisodes.find(
            (e) => e.episode_number.toString() === currentEpNumber.toString(),
          );
          if (foundEp) setCurrentEpisode(foundEp);
          else setCurrentEpisode(targetEpisodes[0] ?? null);
        } else {
          setCurrentEpisode(targetEpisodes?.[0] ?? null);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to load watch data by slug:", error);
        setProductionData(null);
        setCurrentEpisode(null);
        setCurrentSeasonId(null);
        setEpisodeList([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [slug]);

  // --- EFFECT 2: SYNC EPISODE FROM URL ---
  useEffect(() => {
    if (episodeList.length > 0 && currentEpNumber) {
      const foundEp = episodeList.find(
        (e) => e.episode_number.toString() === currentEpNumber.toString(),
      );
      if (foundEp && foundEp.id !== currentEpisode?.id) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentEpisode(foundEp);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [currentEpNumber, episodeList]);

  // --- HANDLERS ---

  const handleChangeEpisode = (episode) => {
    setCurrentEpisode(episode);
    window.scrollTo({ top: 0, behavior: "smooth" });
    messageApi.success(`Đang phát tập ${episode.episode_number}`);

    // Update URL chuẩn
    if (productionData.type === "series") {
      setSearchParams({
        ss: currentSeasonParam,
        ep: episode.episode_number,
      });
    } else {
      setSearchParams({ ep: episode.episode_number });
    }
  };

  const handleChangeSeason = (seasonId) => {
    if (seasonId === currentSeasonId) return;

    const selectedSeason = productionData?.seasons?.find((s) => s.id === seasonId);
    const newSeasonNum = selectedSeason?.season_number || 1;
    const newEpisodes = Array.isArray(selectedSeason?.episodes)
      ? selectedSeason.episodes
      : [];

    setEpisodeList(newEpisodes);
    setCurrentSeasonId(seasonId);

    if (newEpisodes.length > 0) {
      const firstEp = newEpisodes[0];
      setCurrentEpisode(firstEp);
      setSearchParams({
        ss: newSeasonNum,
        ep: firstEp.episode_number,
      });
    } else {
      setCurrentEpisode(null);
      setSearchParams({ ss: newSeasonNum });
    }

    messageApi.info(`Đã chuyển sang Mùa ${newSeasonNum}`);
  };

  const handleNextEpisode = () => {
    const currentIndex = episodeList.findIndex(
      (ep) => ep.id === currentEpisode.id,
    );
    if (currentIndex !== -1 && currentIndex < episodeList.length - 1) {
      const nextEp = episodeList[currentIndex + 1];
      handleChangeEpisode(nextEp);
    } else {
      messageApi.warning("Đây là tập cuối của mùa này rồi!");
    }
  };

  // Trả về tất cả dữ liệu và hàm cần thiết cho View
  return {
    loading,
    productionData,
    currentEpisode,
    currentSeasonId,
    episodeList,
    playerSettings,
    setPlayerSettings,
    isLightOff,
    setLightOff,
    contextHolder,
    handlers: {
      handleChangeEpisode,
      handleChangeSeason,
      handleNextEpisode,
    },
  };
};

import { PoweruserModule, PoweruserModuleId } from "@/types";
import AdvancedComments from "./AdvancedComments/AdvancedComments";
import AnonymousTitle from "./AnonymousTitle/AnonymousTitle";
import BenisInNavbar from "./BenisInNavbar/BenisInNavbar";
import Chat from "./Chat/Chat";
import DefaultFilters from "./DefaultFilters/DefaultFilters";
import DesktopNotifications from "./DesktopNotifications/DesktopNotifications";
import FilterMarks from "./FilterMarks/FilterMarks";
import ImageOCR from "./ImageOCR/ImageOCR";
import NotificationCenter from "./NotificationCenter/NotificationCenter";
import Pr0p0ll from "./Pr0poll/Pr0p0ll";
import Rep0st from "./Rep0st/Rep0st";
import RepostMarker from "./RepostMarker/RepostMarker";
import StatisticsLinkInNavbar from "./StatisticsInNavbar/StatisticsLinkInNavbar";
import StyleCustomization from "./StyleCustomization/StyleCustomization";
import ViewedPostsMarker from "./ViewedPostsMarker/ViewedPostsMarker";
import WidescreenMode from "./WidescreenMode/WidescreenMode";
import DownloadButton from "./DownloadButton/DownloadButton";

export const modules: Record<PoweruserModuleId, () => PoweruserModule> = {
    'StyleCustomization': () => new StyleCustomization(),
    'AdvancedComments': () => new AdvancedComments(),
    'AnonymousTitle': () => new AnonymousTitle(),
    'BenisInNavbar': () => new BenisInNavbar(),
    'Chat': () => new Chat(),
    'DefaultFilters': () => new DefaultFilters(),
    'DesktopNotifications': () => new DesktopNotifications(),
    'FilterMarks': () => new FilterMarks(),
    'ImageOCR': () => new ImageOCR(),
    'Rep0st': () => new Rep0st(),
    'RepostMarker': () => new RepostMarker(),
    'StatisticsLinkInNavbar': () => new StatisticsLinkInNavbar(),
    'ViewedPostsMarker': () => new ViewedPostsMarker(),
    'NotificationCenter': () => new NotificationCenter(),
    'Pr0p0ll': () => new Pr0p0ll(),
    'WidescreenMode': () => new WidescreenMode(),
    "DownloadButton": () => new DownloadButton(),
};

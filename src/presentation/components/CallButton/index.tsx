import { HTMLAttributes } from "react";
import {
  FaCopy,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import { HiPhoneMissedCall } from "react-icons/hi";
import { MdScreenShare } from "react-icons/md";

const callButtonIcons = {
  microphone: FaMicrophone,
  muted: FaMicrophoneSlash,
  video: FaVideo,
  ["hidden-video"]: FaVideoSlash,
  copy: FaCopy,
  ["share-screen"]: MdScreenShare,
  ["end-call"]: HiPhoneMissedCall,
};

export type CallButtonIconTypes = keyof typeof callButtonIcons;

type CallButtonProps = HTMLAttributes<HTMLButtonElement> & {
  icon: keyof typeof callButtonIcons;
  iconSize?: number;
};

const CallButton = ({ icon, iconSize = 12, ...rest }: CallButtonProps) => {
  const Icon = callButtonIcons[icon];

  return (
    <button
      {...rest}
      className={`py-2 px-4 transition-colors rounded-sm bg-neutral-1000  ${
        rest.className ? rest.className : ""
      }`}
    >
      <Icon size={iconSize} color="#ffffff" />
    </button>
  );
};

export default CallButton;

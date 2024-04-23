import { useEffect, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import usePublisherContext from '../../hooks/usePublisherContext';
import ConnectionAlert from '../../components/MeetingRoom/ConnectionAlert';
import Toolbar from '../../components/MeetingRoom/Toolbar';
import useSessionContext from '../../hooks/useSessionContext';
import useScreenShare from '../../hooks/useScreenShare';
import VideoTileCanvas from '../../components/MeetingRoom/VideoTileCanvas';
import EmojisOrigin from '../../components/MeetingRoom/EmojisOrigin';
import RightPanel from '../../components/MeetingRoom/RightPanel';
import useRoomName from '../../hooks/useRoomName';
import useHeight from '../../hooks/useHeight';
import { PUBLISHING_BLOCKED_CAPTION } from '../../utils/constants';

/**
 * MeetingRoom Component
 *
 * This component renders the meeting room page of the application, including:
 * - All other users in the room (some may be hidden) and a screenshare (if applicable).
 * - A video preview of the user and a preview of their screenshare (if applicable).
 * - A toolbar to control user media, adjust room properties, and set viewing options.
 * @returns {ReactElement} - The meeting room.
 */
const MeetingRoom = (): ReactElement => {
  const roomName = useRoomName();
  const height = useHeight();
  const {
    publisher,
    publish,
    quality,
    initializeLocalPublisher,
    isPublishingError,
    isVideoEnabled,
  } = usePublisherContext();
  const {
    joinRoom,
    subscriberWrappers,
    connected,
    disconnect,
    reconnecting,
    rightPanelActiveTab,
    toggleChat,
    toggleParticipantList,
    closeRightPanel,
    toggleReportIssue,
  } = useSessionContext();
  const { isSharingScreen, screensharingPublisher, screenshareVideoElement, toggleShareScreen } =
    useScreenShare();
  const navigate = useNavigate();

  useEffect(() => {
    if (joinRoom && roomName) {
      const sanitizedRoomName = encodeURIComponent(roomName);
      joinRoom(sanitizedRoomName);
    }
    return () => {
      // Ensure to disconnect session when unmounting meeting room in order
      disconnect?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName]);

  useEffect(() => {
    if (!publisher) {
      initializeLocalPublisher();
    }
  }, [initializeLocalPublisher, publisher]);

  useEffect(() => {
    if (connected && publisher && publish) {
      publish();
    }
  }, [publisher, publish, connected]);

  // If the user is unable to publish, we redirect them to the goodbye page.
  // This prevents users from subscribing to other participants in the room, and being unable to communicate with them.
  useEffect(() => {
    if (isPublishingError) {
      navigate('/goodbye', {
        state: {
          header: 'Difficulties joining room',
          caption: PUBLISHING_BLOCKED_CAPTION,
          roomName,
        },
      });
    }
  }, [isPublishingError, navigate, roomName]);

  return (
    <div data-testid="meetingRoom" className="meetingRoom w-screen" style={{ height }}>
      <VideoTileCanvas
        isSharingScreen={isSharingScreen}
        screensharingPublisher={screensharingPublisher}
        screenshareVideoElement={screenshareVideoElement}
        isRightPanelOpen={rightPanelActiveTab !== 'closed'}
        toggleParticipantList={toggleParticipantList}
      />
      <RightPanel activeTab={rightPanelActiveTab} handleClose={closeRightPanel} />
      <EmojisOrigin />
      <Toolbar
        isSharingScreen={isSharingScreen}
        toggleShareScreen={toggleShareScreen}
        rightPanelActiveTab={rightPanelActiveTab}
        toggleParticipantList={toggleParticipantList}
        toggleChat={toggleChat}
        toggleReportIssue={toggleReportIssue}
        participantCount={
          subscriberWrappers.filter(({ isScreenshare }) => !isScreenshare).length + 1
        }
      />
      {reconnecting && (
        <ConnectionAlert
          title="Lost connection"
          message="Please verify your network connection"
          severity="error"
        />
      )}
      {!reconnecting && quality !== 'good' && isVideoEnabled && (
        <ConnectionAlert
          closable
          title="Video quality problem"
          message="Please check your connectivity. Your video may be disabled to improve the user experience"
          severity="warning"
        />
      )}
    </div>
  );
};

export default MeetingRoom;

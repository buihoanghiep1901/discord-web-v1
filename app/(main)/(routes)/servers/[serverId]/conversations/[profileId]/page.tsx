import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/media-room";

interface ProfileIdPageProps {
  params: {
    profileId: string;
    serverId: string;
  },
  searchParams: {
    video?: boolean;
  }
}

const ProfileIdPage = async ({
  params,
  searchParams,
}: ProfileIdPageProps) => {
  const currProfile = await currentProfile();

  if (!currProfile) {
    return auth().redirectToSignIn();
  }


  const conversation = await getOrCreateConversation(currProfile.id, params.profileId);
  console.log('convo: ',conversation)

  if (!conversation) {
    return redirect(`/servers/${params.serverId}`);
  }

  const { profileOne, profileTwo } = conversation;

  const otherProfile = profileOne.id === currProfile.id ? profileTwo : profileOne;

  return ( 
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherProfile.imageUrl}
        name={otherProfile.name}
        serverId={params.serverId}
        type="conversation"
      />
      {searchParams.video && (
        <MediaRoom
          chatId={conversation.id}
          video={true}
          audio={true}
        />
      )}
      {!searchParams.video && (
        <>
          <ChatMessages
            profile={currProfile}
            name={otherProfile.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{
              conversationId: conversation.id,
            }}
          />
          <ChatInput
            name={otherProfile.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{
              conversationId: conversation.id,
            }}
          />
        </>
      )}
    </div>
   );
}
 
export default ProfileIdPage;
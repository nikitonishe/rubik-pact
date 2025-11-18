module.exports = [
  { kubikName: 'companies.channels.conversations', apiName: 'channels/{{channelId}}/conversations' },
  { kubikName: 'companies.conversations.messages', apiName: 'conversations/{{conversationId}}/messages' },
  { kubikName: 'companies.conversations.messages.attachments', apiName: 'attachments' },
  { kubikName: 'companies.conversationsGet', apiName: 'conversations/{{conversationId}}' },
  { kubikName: 'companies.companyId', apiName: 'companies/{{companyId}}' }
];

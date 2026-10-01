from rest_framework import serializers
from apps.ai_assistant.models import KnowledgeDocument, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'role', 'content', 'created_at')
        read_only_fields = ('id', 'role', 'content', 'created_at')


class KnowledgeDocumentSerializer(serializers.ModelSerializer):
    chunk_count = serializers.SerializerMethodField()

    class Meta:
        model = KnowledgeDocument
        fields = ('id', 'title', 'category', 'file', 'is_active', 'created_at', 'chunk_count')
        read_only_fields = ('id', 'created_at', 'chunk_count')

    def get_chunk_count(self, obj):
        return obj.chunks.count()


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(
        max_length=1000,
        required=True,
        error_messages={
            'max_length': 'Message is too long, please keep it under 1000 characters.',
            'blank': 'Message cannot be empty.',
            'required': 'Message is required.',
        }
    )

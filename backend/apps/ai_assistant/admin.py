from django.contrib import admin
from apps.ai_assistant.models import KnowledgeDocument, DocumentChunk, Message, ReportSummary


@admin.register(KnowledgeDocument)
class KnowledgeDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'is_active', 'uploaded_by', 'created_at')
    list_filter = ('category', 'is_active')
    search_fields = ('title',)


@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ('id', 'document', 'chunk_index', 'created_at')
    search_fields = ('chunk_text',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'role', 'created_at')
    list_filter = ('role',)
    search_fields = ('content',)


@admin.register(ReportSummary)
class ReportSummaryAdmin(admin.ModelAdmin):
    list_display = ('id', 'report', 'created_at')
    search_fields = ('summary_text',)

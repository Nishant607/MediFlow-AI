from django.urls import path
from apps.billing.views import (
    MyInvoicesView,
    InvoiceDetailView,
    PayInvoiceView,
    AllInvoicesView
)

urlpatterns = [
    path('invoices/mine/', MyInvoicesView.as_view(), name='my-invoices'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('invoices/<int:pk>/pay/', PayInvoiceView.as_view(), name='pay-invoice'),
    path('invoices/', AllInvoicesView.as_view(), name='all-invoices'),
]

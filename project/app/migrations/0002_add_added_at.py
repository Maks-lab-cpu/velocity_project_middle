from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='favorite',
            name='added_at',
            field=models.DateTimeField(auto_now_add=True, default=None, verbose_name='Добавлено'),
            preserve_default=False,
        ),
    ]
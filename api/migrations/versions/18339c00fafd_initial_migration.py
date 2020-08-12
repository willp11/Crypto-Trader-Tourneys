"""Initial migration.

Revision ID: 18339c00fafd
Revises: 
Create Date: 2020-08-01 19:55:46.174029

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '18339c00fafd'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('registrationTourneys',
    sa.Column('tourneyId', sa.Integer(), nullable=False),
    sa.Column('host', sa.String(length=100), nullable=False),
    sa.Column('maxEntrants', sa.Integer(), nullable=False),
    sa.Column('startDate', sa.String(length=16), nullable=False),
    sa.Column('startTime', sa.String(length=16), nullable=False),
    sa.Column('endDate', sa.String(length=16), nullable=False),
    sa.Column('endTime', sa.String(length=16), nullable=False),
    sa.PrimaryKeyConstraint('tourneyId')
    )
    op.create_table('userAPI',
    sa.Column('userId', sa.String(length=50), nullable=False),
    sa.Column('API1', sa.String(length=50), nullable=True),
    sa.Column('API2', sa.String(length=50), nullable=True),
    sa.Column('API3', sa.String(length=50), nullable=True),
    sa.ForeignKeyConstraint(['userId'], ['usernames.userId'], ),
    sa.PrimaryKeyConstraint('userId')
    )
    op.drop_table('registrationtourneys')
    op.drop_constraint('entrants_ibfk_1', 'entrants', type_='foreignkey')
    op.create_foreign_key(None, 'entrants', 'registrationTourneys', ['tourneyId'], ['tourneyId'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'entrants', type_='foreignkey')
    op.create_foreign_key('entrants_ibfk_1', 'entrants', 'registrationtourneys', ['tourneyId'], ['tourneyId'])
    op.create_table('registrationtourneys',
    sa.Column('tourneyId', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('host', mysql.VARCHAR(length=100), nullable=False),
    sa.Column('maxEntrants', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('startDate', mysql.VARCHAR(length=16), nullable=False),
    sa.Column('startTime', mysql.VARCHAR(length=16), nullable=False),
    sa.Column('endDate', mysql.VARCHAR(length=16), nullable=False),
    sa.Column('endTime', mysql.VARCHAR(length=16), nullable=False),
    sa.PrimaryKeyConstraint('tourneyId'),
    mysql_collate='utf8mb4_0900_ai_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.drop_table('userAPI')
    op.drop_table('registrationTourneys')
    # ### end Alembic commands ###

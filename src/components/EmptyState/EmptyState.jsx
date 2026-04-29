import React from 'react';
import { IconPlus } from '@tabler/icons-react';
import classes from './EmptyState.module.css';

const EmptyState = ({ onAdd }) => (
    <div className={classes.emptyStateContainer}>
        <div onClick={onAdd} className={classes.createButton}>
            <IconPlus size={32} strokeWidth={2.5} />
            <span className={classes.buttonLabel}>CREATE FIRST CONTAINER</span>
        </div>
    </div>
);

export default EmptyState;

import { Form, Input, InputNumber, Popconfirm, Table, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

interface Item {
  id: number;
  isim: string;
  age: number;
  address: string;
  // key: string
}

//http://ant.design/components/table

// const originData: Item[] = [];
// for (let i = 0; i < 40; i++) {
//   originData.push({
//     key: i.toString(),
//     isim: `Kaan ${i}`,
//     age: 32,
//     address: `Yağmur caddesi  ${i}`,
//    });
//}
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  children: React.ReactNode;
}


const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};



const App: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<Item[]>({} as Item[]);
  const [editingKey, setEditingKey] = useState<number>(-1);

  const isEditing = (record: Item) => record.id  === editingKey;

  

  useEffect(() => {
    const getUsers = async () => {
      const users : Item[] = await fetchUsers();
      setData(users);
    };

    getUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:4000/users');
    const users = await res.json();
    console.log("users:",users);

    return users;
  };

  
  const edit = (record: Partial<Item>) => {
    console.log("record:",record);
    form.setFieldsValue({ isim: '', age: '', address: '', ...record });
    setEditingKey(record.id||-1);
  };

  const remove = (record: Partial<Item>) => {
    console.log("record:",record);
    form.setFieldsValue({ isim: '', age: '', address: '', ...record });
    setEditingKey(record.id||-1);
  };

  const cancel = () => {
    setEditingKey(-1);
  };

  const save = async (id: React.Key) => {
    try {
      const row = (await form.validateFields()) as Item;

      const newData = [...data];
      const index = newData.findIndex(item => id === item.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey(-1);
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey(-1);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      width: '25%',
      editable: true,
    },
    {
      title: 'age',
      dataIndex: 'age',
      width: '15%',
      editable: true,
    },
    {
      title: 'address',
      dataIndex: 'address',
      width: '40%',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        console.log("record:",record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.id)} style={{ marginRight: 8 }}>
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <span>
          <Typography.Link disabled={editingKey !== -1} onClick={() => edit(record)}>
            Edit
          </Typography.Link>{' '}
            <Typography.Link disabled={editingKey !== -1} onClick={() => remove(record)}>
            Delete
          </Typography.Link>
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  console.log("data:",data);

  return (
    
      <div>
        {( data && data.length>0) && <>
        <Form form={form} component={false}>
        <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            dataSource={data}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{
              onChange: cancel,
            }}
          />
        </Form>
        </>}
     </div>)
    
  
}

export default App;
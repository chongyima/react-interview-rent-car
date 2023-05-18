import React, { useEffect, useRef, useState } from "react";
import Pagination from "rc-pagination";
import { throttle } from "lodash";
import cloneDeep from "lodash/cloneDeep";
import "rc-pagination/assets/index.css";

interface IData {
  attributes: any;
  relationships: any;
  id: string;
  type: string;
}
interface IIncluded {
  attributes: any;
  id: string;
  type: string;
}
export default function Table() {
  const [value, setValue] = useState("");
  const [countPerPage, setCountPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState<{
    data: IData[];
    included: IIncluded[];
    meta: any;
    suggestions: any;
  }>({
    data: [],
    included: [],
    meta: {},
    suggestions: null,
  });
  const [collection, setCollection] = React.useState(
    cloneDeep(allData?.data?.slice(0, countPerPage))
  );

  const searchData = useRef(
    throttle((val) => {
      setCurrentPage(1);
      fetch(`https://search.outdoorsy.com/rentals?filter[keywords]=${val}`)
        .then((res) => res.json())
        .then((data) => {
          setAllData(data);
          setCollection(cloneDeep(data.data.slice(0, countPerPage)));
        });
    }, 400)
  );

  useEffect(() => {
    if (value) {
      searchData.current(value);
    }
  }, [value]);

  const updatePage = (p: number) => {
    setCurrentPage(p);
    const to = countPerPage * p;
    const from = to - countPerPage;
    setCollection(cloneDeep(allData.data.slice(from, to)));
  };

  const tableData = () => {
    return collection.map((item: IData, index: number) => {
      const imageId = item.relationships.primary_image.data.id;
      const imageUrl = allData.included.find(
        (obj: IIncluded) => obj.type === "images" && obj.id === imageId
      )?.attributes.url as string;
      return (
        <tr key={index}>
          <td>
            <img src={imageUrl} alt="" width={70} height={50}></img>
          </td>
          <td>{item.attributes.name}</td>
        </tr>
      );
    });
  };
  return (
    <>
      <div className="search">
        <input
          placeholder="Search Keyword"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      {value && allData.data.length > 0 && (
        <>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name of Rental</th>
              </tr>
            </thead>
            <tbody className="trhover">{tableData()}</tbody>
          </table>
          <Pagination
            pageSize={countPerPage}
            onChange={updatePage}
            current={currentPage}
            total={allData.data.length}
          />
        </>
      )}
    </>
  );
}
